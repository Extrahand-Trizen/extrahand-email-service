import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).refine(n => n > 0 && n < 65536, 'Port must be between 1-65535').default('4007'),
  
  // MongoDB
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),
  MONGODB_DB: z.string().default('extrahand'),
  
  // Service Authentication
  SERVICE_AUTH_TOKEN: z.string().min(32, 'SERVICE_AUTH_TOKEN must be at least 32 characters'),
  
  // Email Provider
  EMAIL_PROVIDER: z.enum(['smtp', 'sendgrid', 'ses']).default('smtp'),
  
  // SMTP Configuration (Microsoft/Outlook optimized)
  SMTP_HOST: z.string().default('smtp.office365.com'),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_SECURE: z.string().transform(val => val === 'true').default('false'),
  SMTP_USER: z.string().email('Invalid SMTP user email'),
  SMTP_PASS: z.string().min(1, 'SMTP password is required'),
  
  // SendGrid (optional)
  SENDGRID_API_KEY: z.string().optional(),
  
  // AWS SES (optional)
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  
  // Email Settings
  EMAIL_FROM_ADDRESS: z.string().email('Invalid from email address'),
  EMAIL_FROM_NAME: z.string().default('ExtraHand'),
  EMAIL_REPLY_TO: z.string().email().optional(),
  
  // Application URLs
  WEB_APP_URL: z.string().url('Invalid web app URL').default('https://extrahand.in'),
  MOBILE_APP_DEEP_LINK: z.string().default('extrahand://'),
  LOGO_URL: z.string().url('Invalid logo URL').optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // CORS
  CORS_ORIGIN: z.string().optional(),

  /** Fallback when POST /admin-invite omits platformName (e.g. legacy callers). Ticket service should send platformName explicitly. */
  DEFAULT_ADMIN_INVITE_PLATFORM_NAME: z.string().min(1).optional(),
});

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    
    // Validate provider-specific requirements
    if (env.EMAIL_PROVIDER === 'sendgrid' && !env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is required when EMAIL_PROVIDER is sendgrid');
    }
    
    if (env.EMAIL_PROVIDER === 'ses' && (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY)) {
      throw new Error('AWS credentials are required when EMAIL_PROVIDER is ses');
    }
    
    // For Microsoft SMTP, ensure FROM address matches SMTP user
    if (env.EMAIL_PROVIDER === 'smtp' && env.SMTP_HOST.toLowerCase().includes('office365')) {
      if (env.EMAIL_FROM_ADDRESS !== env.SMTP_USER) {
        console.warn('⚠️  Warning: For Microsoft/Office365, EMAIL_FROM_ADDRESS should match SMTP_USER');
      }
    }
    
    return env;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    process.exit(1);
  }
}

export type EnvConfig = z.infer<typeof envSchema>;
