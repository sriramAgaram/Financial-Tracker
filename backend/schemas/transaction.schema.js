const { z } = require('zod');

const transactionSchemas = {
    add: z.object({
        body: z.object({
            amount: z.number({ required_error: "Amount is required" }).positive("Amount must be positive"),
            expense_type_id: z.number({ required_error: "Expense type is required" }),
            ledger_id: z.any().optional(),
            date: z.string({ required_error: "Date is required" }).refine((val) => !isNaN(Date.parse(val)), {
                message: "Invalid date format",
            }),
        }),
    }),
    update: z.object({
        params: z.object({
            id: z.string().or(z.number()),
        }),
        body: z.object({
            amount: z.number().positive("Amount must be positive").optional(),
            expense_type_id: z.number().optional(),
            ledger_id: z.any().optional(),
            date: z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: "Invalid date format",
            }).optional(),
        }),
    }),
    lists: z.object({
        body: z.object({
            pageNumber: z.number({ required_error: "Page number is required" }).min(1),
            rows: z.number({ required_error: "Rows per page is required" }).min(1),
            ledger_id: z.any().optional(),
            category: z.array(z.number()).optional(),
        }),
    }),
};

module.exports = transactionSchemas;
