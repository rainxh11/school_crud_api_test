import {z} from "zod";
import {Types} from "mongoose";
import {isValid, parse} from "date-fns";

export const Id = z.string()
    .refine(id => Types.ObjectId.isValid(id), {message: "Not a valid ObjectId!"})
export const PhoneNumber = z.string()
    .regex(/^(\+|\d)[\d ()-]{8,}$/, {message: "Invalid Phone Number!"})
export const ArabicString = z.string().regex(/^[\u0621-\u064A0-9 ]+$/, {message: "Only Arabic Characters Allowed!"})

export const DateOnly = z.string().refine(d => isValid(parse(d, "yyyy-MM-dd", new Date())),
    {message: "Date must follow YYYY-MM-DD format!"})