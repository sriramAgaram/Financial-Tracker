const { z } = require('zod');

const ledgerSchemas = {
    add: z.object({
        body: z.object({
            name: z.string({ required_error: "Ledger name is required" }).min(2, "Name must be at least 2 characters"),
        }),
    }),
    update: z.object({
        params: z.object({
            id: z.string().or(z.number()),
        }),
        body: z.object({
            name: z.string().min(2, "Name must be at least 2 characters").optional(),
            is_default: z.boolean().optional(),
        }),
    }),
};

module.exports = ledgerSchemas;
