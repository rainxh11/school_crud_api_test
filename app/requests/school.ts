import {z} from "zod"

export const CreateSchoolRequest = z.object({
    name: z.string().min(5).max(64),
    director_name: z.string().optional(),
    address: z.string(),
    phone_number: z.string()
        .regex(/^(\+|\d)[\d ()-]{8,}$/, {message: "Invalid Phone Number!"}),
})

export type CreateSchoolRequest = z.infer<typeof CreateSchoolRequest>

export const UpdateSchoolRequest = z.object({
    name: z.string().min(5).max(64).optional(),
    director_name: z.string().optional(),
    address: z.string().optional(),
    phone_number: z.string()
        .regex(/^(\+|\d)[\d ()-]{8,}$/, {message: "Invalid Phone Number!"})
        .optional(),
})
export type UpdateSchoolRequest = z.infer<typeof UpdateSchoolRequest>