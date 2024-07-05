import {z} from 'zod'

export const SignupRequest = z.object({
    username: z.string().min(3).regex(/^[a-zA-Z0-9_.-]+$/),
    password: z.string().min(8).max(24),
    confirm_password: z.string(),
    role: z.enum(["super_admin", "school_admin"]).default("school_admin").optional(),
}).refine((value) => value.confirm_password === value.password, {message: "Both Passwords must match!"})
export type SignupRequest = z.infer<typeof SignupRequest>

export const LoginRequest = z.object({
    username: z.string()
        .min(3)
        .regex(/^[a-zA-Z0-9_.-]+$/),
    password: z.string().min(8).max(24),
})
export type LoginRequest = z.infer<typeof LoginRequest>

export const UpdateAccountPasswordRequest = z.object({
    username: z.string().optional(),
    current_password: z.string().min(8).max(24),
    new_password: z.string().min(8).max(24),
    confirm_new_password: z.string().min(8).max(24),
    role: z.enum(["super_admin", "school_admin"]).default("school_admin").optional(),
})
    .refine((value) => value.current_password !== value.new_password, {message: "Cannot re-use the current password!"})
    .refine((value) => value.new_password === value.confirm_new_password, {message: "New password confirmation must match new password!"})
export type UpdateAccountPasswordRequest = z.infer<typeof UpdateAccountPasswordRequest>