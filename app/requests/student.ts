import {z} from "zod"
import {ArabicString, Id, PhoneNumber} from "./common.ts";
import {parse, subYears} from "date-fns";

export const NestedParentRequest = z.object({
    full_name: z.string(),
    arabic_name: ArabicString,
    birth_date: z.string().pipe(z.coerce.date()
        .min(parse("1950-01-01", "yyyy-MM-dd", new Date()))
        .max(subYears(Date.now(), 4))),
    phone_number: PhoneNumber,
    address: z.string(),
    identification_number: z.string(),
    parenthood_type: z.enum(["Guardian", "Father", "Mother", "Adult_Sibling", "Legal_Guardian"])
        .default("Legal_Guardian"),
})
export type NestedParentRequest = z.infer<typeof NestedParentRequest>

export const CreateStudentRequest = z.object({
    full_name: z.string(),
    arabic_name: ArabicString,
    birth_date: z.string().pipe(z.coerce.date()
        .min(parse("1950-01-01", "yyyy-MM-dd", new Date()))
        .max(subYears(Date.now(), 4))),
    phone_number: PhoneNumber,
    address: z.string(),
    parents: z.array(NestedParentRequest).optional().default([]),
    classes: z.array(Id).optional().default([]),
})
export type CreateStudentRequest = z.infer<typeof CreateStudentRequest>

export const UpdateStudentRequest = z.object({
    full_name: z.string().optional(),
    arabic_name: ArabicString.optional(),
    birth_date: z.string().pipe(z.coerce.date()
        .min(parse("1950-01-01", "yyyy-MM-dd", new Date()))
        .max(subYears(Date.now(), 4))).optional(),
    phone_number: PhoneNumber.optional(),
    address: z.string().optional(),
    parents: z.array(NestedParentRequest).optional(),
    classes: z.array(Id).optional(),
})
export type UpdateStudentRequest = z.infer<typeof UpdateStudentRequest>