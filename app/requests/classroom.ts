import {z} from "zod"
import {addDays, parse, subYears} from "date-fns";
import {Id, PhoneNumber} from "./common.ts";

export const TeacherNestedRequest = z.object({
    name: z.string().min(5).max(64),
    hired_at: z.string().pipe(z.coerce.date()
        .min(parse("2000-01-01", "yyyy-MM-dd", new Date()))
        .max(addDays(Date.now(), 1))),
    birth_date: z.string().pipe(z.coerce.date()
        .min(parse("1950-01-01", "yyyy-MM-dd", new Date()))
        .max(subYears(Date.now(), 18))),
    identification_number: z.string(),
    phone_number: PhoneNumber,
    qualifications: z.array(z.string()),
    subject: z.string(),
})
export type TeacherNestedRequest = z.infer<typeof TeacherNestedRequest>

export const CreateClassRoomRequest = z.object({
    name: z.string().min(5).max(64),
    teacher: TeacherNestedRequest,
    capacity: z.number().min(5).max(100),
    major_subject: z.string(),
    school: Id,
    school_year: z.number()
})
export type CreateClassRoomRequest = z.infer<typeof CreateClassRoomRequest>

export const UpdateClassRoomRequest = z.object({
    name: z.string().min(5).max(64).optional(),
    teacher: TeacherNestedRequest.optional(),
    capacity: z.number().min(5).max(100).optional(),
    major_subject: z.string().optional(),
    school: Id.optional(),
    school_year: z.number().optional()
})
export type UpdateClassRoomRequest = z.infer<typeof UpdateClassRoomRequest>