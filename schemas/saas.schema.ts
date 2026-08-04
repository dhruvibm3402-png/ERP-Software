import { z } from 'zod';

export const createTenantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    subdomain: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/, "Invalid subdomain"),
    currency: z.string().optional(),
    timezone: z.string().optional()
});

export const updateTenantSchema = createTenantSchema.partial();
