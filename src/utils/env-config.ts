import { z } from 'zod';

// Sanitization utility to prevent script injection
function sanitizeEnvValue(value: string): string {
  // More comprehensive sanitization
  return value
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/[<>&'"]/g, '') // Remove potential XSS characters
    .trim();
}

// Environment configuration schema
const EnvConfigSchema = z.object({
  // GitHub OAuth configuration
  VITE_GITHUB_CLIENT_ID: z.string().min(10, 'GitHub Client ID must be at least 10 characters'),
  VITE_GITHUB_REDIRECT_URI: z.string().url('Invalid GitHub redirect URI'),

  // ORCID OAuth configuration
  VITE_ORCID_CLIENT_ID: z.string().min(10, 'ORCID Client ID must be at least 10 characters'),
  VITE_ORCID_REDIRECT_URI: z.string().url('Invalid ORCID redirect URI'),

  // Optional configuration with fallbacks
  VITE_APP_NAME: z.string().default('Pubcraft Editor'),
  VITE_APP_VERSION: z.string().default('0.1.0'),
  VITE_DEBUG_MODE: z.enum(['true', 'false']).default('false'),
  VITE_BYPASS_AUTH: z.enum(['true', 'false']).default('false'),

  // API endpoints
  VITE_GITHUB_API_BASE_URL: z.string().url().default('https://api.github.com'),
  VITE_GITHUB_TOKEN_URL: z.string().url('Invalid GitHub Token URL'),
  VITE_ORCID_API_BASE_URL: z.string().url().default('https://orcid.org/oauth'),
  VITE_ORCID_PRODUCTION_URL: z.string().url('Invalid ORCID Production URL'),
  VITE_ORCID_SCOPE: z.string().default('/authenticate'),
  VITE_ORCID_TOKEN_URL: z.string().url('Invalid ORCID Token URL')
});

// Type for environment configuration
export type EnvConfig = z.infer<typeof EnvConfigSchema>;

// Runtime environment configuration loader
export function loadRuntimeEnvConfig(): EnvConfig {
  // First, try to load from window.ENV (runtime injection)
  const windowEnv = (window as any).ENV || {};

  // Prepare raw configuration
  const rawConfig = {
    VITE_GITHUB_CLIENT_ID: windowEnv.VITE_GITHUB_CLIENT_ID || import.meta.env.VITE_GITHUB_CLIENT_ID,
    VITE_GITHUB_REDIRECT_URI: windowEnv.VITE_GITHUB_REDIRECT_URI || import.meta.env.VITE_GITHUB_REDIRECT_URI,
    VITE_ORCID_CLIENT_ID: windowEnv.VITE_ORCID_CLIENT_ID || import.meta.env.VITE_ORCID_CLIENT_ID,
    VITE_ORCID_REDIRECT_URI: windowEnv.VITE_ORCID_REDIRECT_URI || import.meta.env.VITE_ORCID_REDIRECT_URI,
    VITE_APP_NAME: windowEnv.VITE_APP_NAME || import.meta.env.VITE_APP_NAME,
    VITE_APP_VERSION: windowEnv.VITE_APP_VERSION || import.meta.env.VITE_APP_VERSION,
    VITE_DEBUG_MODE: windowEnv.VITE_DEBUG_MODE || import.meta.env.VITE_DEBUG_MODE,
    VITE_GITHUB_API_BASE_URL: windowEnv.VITE_GITHUB_API_BASE_URL || import.meta.env.VITE_GITHUB_API_BASE_URL,
    VITE_GITHUB_TOKEN_URL: windowEnv.VITE_GITHUB_TOKEN_URL || import.meta.env.VITE_GITHUB_TOKEN_URL,
    VITE_ORCID_API_BASE_URL: windowEnv.VITE_ORCID_API_BASE_URL || import.meta.env.VITE_ORCID_API_BASE_URL,
    VITE_ORCID_PRODUCTION_URL: windowEnv.VITE_ORCID_PRODUCTION_URL || import.meta.env.VITE_ORCID_PRODUCTION_URL,
    VITE_ORCID_SCOPE: windowEnv.VITE_ORCID_SCOPE || import.meta.env.VITE_ORCID_SCOPE,
    VITE_ORCID_TOKEN_URL: windowEnv.VITE_ORCID_TOKEN_URL || import.meta.env.VITE_ORCID_TOKEN_URL
  };

  // Sanitize all values
  const sanitizedConfig = Object.fromEntries(
    Object.entries(rawConfig).map(([key, value]) => 
      [key, typeof value === 'string' ? sanitizeEnvValue(value) : value]
    )
  );

  try {
    // Validate and parse configuration
    const config = EnvConfigSchema.parse(sanitizedConfig);

    // Log warnings for missing or default configurations in debug mode
    if (config.VITE_DEBUG_MODE === 'true') {
      const defaultConfig = EnvConfigSchema.parse({});
      Object.entries(config).forEach(([key, value]) => {
        if (value === (defaultConfig as any)[key]) {
          console.warn(`[ENV] Using default value for ${key}`);
        }
      });

      // Check for runtime vs build-time configuration source
      if (windowEnv.errors && windowEnv.errors.length > 0) {
        console.warn('[ENV] Runtime environment configuration warnings:', windowEnv.errors);
      }
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[ENV] Configuration Validation Error:', error.errors);
      throw new Error('Invalid environment configuration. Please check your configuration.');
    }
    throw error;
  }
}

// Singleton instance of environment configuration
export const envConfig = loadRuntimeEnvConfig();

// Utility to check if the app is in debug mode
export function isDebugMode(): boolean {
  return envConfig.VITE_DEBUG_MODE === 'true';
}

// Utility to get a specific environment variable with optional fallback
export function getEnvVar(key: keyof EnvConfig, fallback?: string): string {
  const value = envConfig[key];
  return value || fallback || '';
}