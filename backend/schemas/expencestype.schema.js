const { z } = require('zod');

const expenseTypeSchemas = {
    add: z.object({
        body: z.object({
            expense_name: z.string({ required_error: "Expense name is required" }).min(2, "Expense name must be at least 2 characters"),
        }),
    }),
    update: z.object({
        params: z.object({
            id: z.string().or(z.number()),
        }),
        body: z.object({
            expense_name: z.string().min(2, "Expense name must be at least 2 characters").optional(),
        }),
    }),
};

module.exports = expenseTypeSchemas;
