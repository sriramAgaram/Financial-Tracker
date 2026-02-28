const { z } = require('zod');

const limitSchemas = {
    add: z.object({
        body: z.object({
            monthly_limit: z.number().positive().optional(),
            daily_limit: z.number({ required_error: "Daily limit is required" }).positive(),
            overall_amount: z.number().positive().optional(),
            ledger_id: z.any().optional(),
        }),
    }),
    update: z.object({
        params: z.object({
            id: z.string().or(z.number()),
        }),
        body: z.object({
            monthly_limit: z.number().positive().optional(),
            daily_limit: z.number().positive().optional(),
            overall_amount: z.number().positive().optional(),
            ledger_id: z.any().optional(),
        }),
    }),
};

module.exports = limitSchemas;
