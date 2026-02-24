const { z } = require('zod');

const authSchemas = {
    initiateSignup: z.object({
        body: z.object({
            name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
            username: z.string({ required_error: "Username is required" }).min(3, "Username must be at least 3 characters"),
            email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
        }),
    }),
    verifyOtp: z.object({
        body: z.object({
            email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
            otp: z.number({ required_error: "OTP is required" }),
        }),
    }),
    completeSignup: z.object({
        body: z.object({
            signupToken: z.string({ required_error: "Signup token is required" }),
            password: z.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters"),
            confirmPassword: z.string({ required_error: "Confirm password is required" }),
        }).refine((data) => data.password === data.confirmPassword, {
            message: "Passwords don't match",
            path: ["confirmPassword"],
        }),
    }),
    login: z.object({
        body: z.object({
            username: z.string({ required_error: "Username is required" }),
            password: z.string({ required_error: "Password is required" }),
        }),
    }),
};

module.exports = authSchemas;
