import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'Strong JWT Secret required for production'),
  NEXTAUTH_SECRET: z.string().min(32, 'Strong NextAuth Secret required'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(parsed.error.format());

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
