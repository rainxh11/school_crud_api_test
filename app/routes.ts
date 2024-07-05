import {type Context, Hono} from 'hono'
import {logger} from 'hono/logger'
import {type CookieConfig, JWTAuth, type JWTAuthConfig, type JWTConfig} from 'hono_jwt_auth';
import {Account} from "./schema/account.ts";
import {zValidator} from '@hono/zod-validator'
import {Validations} from "./requests/validations.ts";
import {LoginRequest} from "./requests/account.ts";
import {HTTPException} from "hono/http-exception";
import {swaggerUI} from '@hono/swagger-ui'
import {SchoolInfo} from "./schema/school.ts";
import {ClassRoom} from "./schema/classroom.ts";
import {Student} from "./schema/student.ts";

type Bindings = {
    JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()
const authJWTConfig: JWTConfig = {
    nbf: 1000 * 60 * 24,
    alg: 'HS512',
    secret: (c: Context) => "621df1c5b1c3b322f9639b98e7d17e2d3fc9f5d7790783066ed555ae1ef40631",
}
const authCookieConfig: CookieConfig = {
    key: 'Authorization',
    httpOnly: true,
    secure: true,
    prefix: 'host',
    path: '/',
    sameSite: 'Strict',
    secret: (c: Context) => "621df1c5b1c3b322f9639b98e7d17e2d3fc9f5d7790783066ed555ae1ef40631",
}
const jwtAuthConfig: JWTAuthConfig = {
    sessionLength: 60 * 60 * 24 * 10,
    redirectURI: '/api/login',
    redirectStyle: 'referrer',
    jwt: authJWTConfig,
    cookie: authCookieConfig,
    logging: true,
    logger: console.log
}
const sessionManager = new JWTAuth<Omit<Account, "password_hash">>(jwtAuthConfig);
app.use(logger())

//------------------ SWAGGER ----------------------------------------------//
app.get('/swagger', swaggerUI({url: '/doc'}))
//------------------ AUTH ENDPOINTS ---------------------------------------//
app.post("/auth/signup", zValidator("json", Validations.SignupRequest), async ctx => {
    const body = ctx.req.valid("json")
    const alreadyExist = await Account.findOne({name: body.username}).exec()
    if (alreadyExist) {
        return ctx.body("User already exists!", {status: 400})
    }
    const password_hash = await Bun.password.hash(body.password)
    const account = new Account({
        name: body.username,
        password_hash: password_hash,
        role: body.role
    })

    const saved = await account.save()
    return ctx.json({
        message: "Account successfully created",
        account: {
            ...saved.toJSON(),
            password_hash: undefined
        }
    }, {status: 201})
})

app.post("/auth/login", zValidator("json", LoginRequest), async ctx => {
    const body = ctx.req.valid("json")
    let account = await Account.findOne({name: body.username}).select(["+password_hash"]).lean().exec()
    if (!account) {
        return ctx.body("Account doesn't exist!", {status: 404})
    }
    const password_valid = await Bun.password.verify(body.password, account.password_hash)
    if (!password_valid) {
        return ctx.body("Password incorrect!", {status: 401})
    }
    account.password_hash = ""

    await sessionManager.addSession(ctx, account.name, {...account})
    return ctx.json({
        ...account,
        password_hash: undefined
    }, {status: 200})
})
//------------------ ACCOUNT ENDPOINTS ---------------------------------------//
app.get("/account", sessionManager.apiAuth(), async ctx => {
    const accounts = await Account.find().lean().exec()
    return ctx.json(accounts)
})

app.get("/account/:id", sessionManager.apiAuth(), async ctx => {
    const {id} = ctx.req.param()
    const account = await Account.findById(id).exec()
    if (!account) {
        return ctx.body("Account doesn't exist!", {status: 404})
    }
    return ctx.json(account.toJSON())
})

app.patch("/account/:id/password",
    sessionManager.apiAuth((_, user) => user.role === "super_admin"),
    zValidator("json", Validations.UpdateAccountPasswordRequest),
    async ctx => {
        const {id} = ctx.req.param()
        const account = await Account.findById(id).exec()
        if (!account) {
            return ctx.body("Account doesn't exist!", {status: 404})
        }
        const body = ctx.req.valid("json")
        const password_hash = await Bun.password.hash(body.new_password)
        const updated = await Account.findByIdAndUpdate(id, {
            password_hash: password_hash,
            last_modified: Date.now()
        }, {new: true})
        if (!updated) {
            throw new HTTPException(500)
        }

        return ctx.json({
            account: {
                ...updated.toJSON(),
                password_hash: undefined
            },
            message: "Account password successfully updated"
        })
    })

app.delete("/account/:id", sessionManager.apiAuth((_, user) => user.role === "super_admin"), async ctx => {
    const {id} = ctx.req.param()
    const account = await Account.findById(id).exec()
    if (!account) {
        return ctx.body("Account doesn't exist!", {status: 404})
    }
    await Account.findByIdAndDelete(id)
    return ctx.status(200)
})
//------------------ SCHOOL ENDPOINTS ---------------------------------------//
app.get("/school", sessionManager.apiAuth(), async ctx => {
    const schools = await SchoolInfo.find().populate(["created_by", "last_updated_by"]).lean().exec()
    return ctx.json(schools)
})

app.get("/school/:id", sessionManager.apiAuth(), async ctx => {
    const {id} = ctx.req.param()
    const school = await SchoolInfo.findById(id).populate(["created_by", "last_updated_by"]).exec()
    if (!school) {
        return ctx.body("School doesn't exist!", {status: 404})
    }
    return ctx.json(school.toJSON())
})

app.post("/school",
    sessionManager.apiAuth((_, user) => user.role === "super_admin"),
    zValidator("json", Validations.CreateSchoolRequest),
    async ctx => {
        const body = ctx.req.valid("json")
        const [, account] = await sessionManager.getSession(ctx)
        const newSchool = new SchoolInfo({
            ...body,
            created_by: account._id
        })
        const saved = await newSchool.save()

        return ctx.json({
            school: {
                ...saved.toJSON()
            },
            message: "School created successfully updated"
        })
    })

app.patch("/school/:id",
    sessionManager.apiAuth((_, user) => user.role === "super_admin"),
    zValidator("json", Validations.UpdateSchoolRequest),
    async ctx => {
        const {id} = ctx.req.param()
        const school = await SchoolInfo.findById(id).exec()
        if (!school) {
            return ctx.body("School doesn't exist!", {status: 404})
        }
        const body = ctx.req.valid("json")
        const [, account] = await sessionManager.getSession(ctx)

        const updated = await SchoolInfo.findByIdAndUpdate(id, {...body, last_updated_by: account._id}, {new: true})
        if (!updated) {
            throw new HTTPException(500)
        }
        return ctx.json({
            school: {
                ...updated.toJSON()
            },
            message: "School updated successfully updated"
        })
    })

app.delete("/school/:id", sessionManager.apiAuth((_, user) => user.role === "super_admin"), async ctx => {
    const {id} = ctx.req.param()
    const school = await SchoolInfo.findById(id).exec()
    if (!school) {
        return ctx.body("School doesn't exist!", {status: 404})
    }
    await SchoolInfo.findByIdAndDelete(id)
    return ctx.status(200)
})
//------------------ CLASS ROOM ENDPOINTS ---------------------------------------//
app.get("/classroom",
    sessionManager.apiAuth(),
    async ctx => {
        const classRooms = await ClassRoom.find().populate(["created_by", "last_updated_by"]).lean().exec()
        return ctx.json(classRooms)
    })

app.get("/classroom/:id",
    sessionManager.apiAuth(),
    async ctx => {
        const {id} = ctx.req.param()
        const classRoom = await ClassRoom.findById(id).populate(["created_by", "last_updated_by"]).lean().exec()
        if (!classRoom) {
            return ctx.body("Class Room doesn't exist!", {status: 404})
        }
        const students = await Student.find({ classes: { $in: [id] }}).lean()
        return ctx.json({classRoom, students: students})
    })

app.post("/classroom",
    sessionManager.apiAuth(),
    zValidator("json", Validations.CreateClassRoomRequest),
    async ctx => {
        const body = ctx.req.valid("json")
        const [, account] = await sessionManager.getSession(ctx)

        const newClassRoom = new ClassRoom({
            ...body,
            created_by: account._id
        })
        const saved = await newClassRoom.save()

        return ctx.json({
            classroom: {
                ...saved.toJSON()
            },
            message: "Class Room created successfully updated"
        })
    })

app.patch("/classroom/:id",
    sessionManager.apiAuth(),
    zValidator("json", Validations.UpdateClassRoomRequest),
    async ctx => {
        const {id} = ctx.req.param()
        const classRoom = await ClassRoom.findById(id).exec()
        if (!classRoom) {
            return ctx.body("Class Room doesn't exist!", {status: 404})
        }
        const body = ctx.req.valid("json")
        const [, account] = await sessionManager.getSession(ctx)

        const updated = await ClassRoom.findByIdAndUpdate(id, {...body, last_updated_by: account._id}, {new: true})
        if (!updated) {
            throw new HTTPException(500)
        }
        return ctx.json({
            classroom: {
                ...updated.toJSON()
            },
            message: "Class Room updated successfully updated"
        })
    })

app.delete("/classroom/:id",
    sessionManager.apiAuth(),
    async ctx => {
        const {id} = ctx.req.param()
        const classRoom = await ClassRoom.findById(id).exec()
        if (!classRoom) {
            return ctx.body("Class Room doesn't exist!", {status: 404})
        }
        await ClassRoom.findByIdAndDelete(id)
        return ctx.status(200)
    })
//------------------ STUDENT ENDPOINTS ---------------------------------------//
app.get("/student",
    sessionManager.apiAuth(),
    async ctx => {
        const students = await Student.find().populate(["classes", "created_by", "last_updated_by"]).lean().exec()
        return ctx.json(students)
    })

app.get("/student/:id",
    sessionManager.apiAuth(),
    async ctx => {
        const {id} = ctx.req.param()
        const student = await Student.findById(id).populate(["classes", "created_by", "last_updated_by"]).exec()
        if (!student) {
            return ctx.body("Student doesn't exist!", {status: 404})
        }
        return ctx.json(student.toJSON())
    })

app.post("/student",
    sessionManager.apiAuth(),
    zValidator("json", Validations.CreateStudentRequest),
    async ctx => {
        const body = ctx.req.valid("json")
        if (body.classes && body.classes.length > 0) {
            const classRooms = await ClassRoom.find().lean()
            const validClasses = body.classes.every(id => classRooms.some(x => x._id.toString() === id))
            if (!validClasses) {
                return ctx.body("Make sure all class rooms ids are valid!", {status: 400})
            }
        }

        const [, account] = await sessionManager.getSession(ctx)

        const newStudent = new Student({
            ...body,
            created_by: account._id
        })
        const saved = await newStudent.save()

        return ctx.json({
            student: {
                ...saved.toJSON()
            },
            message: "Student created successfully updated"
        })
    })

app.patch("/student/:id",
    sessionManager.apiAuth(),
    zValidator("json", Validations.UpdateStudentRequest),
    async ctx => {
        const {id} = ctx.req.param()
        const student = await Student.findById(id).exec()
        if (!student) {
            return ctx.body("Student doesn't exist!", {status: 404})
        }
        const body = ctx.req.valid("json")
        if (body.classes && body.classes.length > 0) {
            const classRooms = await ClassRoom.find().lean()
            const validClasses = body.classes.every(id => classRooms.some(x => x._id.toString() === id))
            if (!validClasses) {
                return ctx.body("Make sure all class rooms ids are valid!", {status: 400})
            }
        }

        const [, account] = await sessionManager.getSession(ctx)

        const updated = await Student.findByIdAndUpdate(id, {...body, last_updated_by: account._id}, {new: true})
        if (!updated) {
            throw new HTTPException(500)
        }
        return ctx.json({
            student: {
                ...updated.toJSON()
            },
            message: "Student updated successfully updated"
        })
    })

app.delete("/student/:id",
    sessionManager.apiAuth(),
    async ctx => {
        const {id} = ctx.req.param()
        const student = await Student.findById(id).exec()
        if (!student) {
            return ctx.body("Student doesn't exist!", {status: 404})
        }
        await Student.findByIdAndDelete(id)
        return ctx.status(200)
    })

//-----------------------------------------------------------------------------------//
export {
    app as serverApp
}