// Environment configuration for the AI Revenue Agent for Shopify

interface EnvConfig {
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  SHOPIFY_APP_URL: string;
  NEXT_PUBLIC_SHOPIFY_API_KEY: string;
  CORE_AI_SERVICE_URL: string;
  CORE_AI_SERVICE_API_KEY: string;
  BACKEND_API_URL: string;
  DATABASE_URL?: string;
  DB_USER?: string;
  DB_HOST?: string;
  DB_NAME?: string;
  DB_PASSWORD?: string;
  DB_PORT?: string;
  NODE_ENV?: string;
}

export function getEnvVar(name: keyof EnvConfig, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  
  return value;
}

export function getOptionalEnvVar(name: keyof EnvConfig, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue;
}

// Validate required environment variables on startup
export function validateEnvironment(): void {
  const requiredVars: (keyof EnvConfig)[] = [
    'SHOPIFY_API_KEY',
    'SHOPIFY_API_SECRET',
    'SHOPIFY_APP_URL',
    'NEXT_PUBLIC_SHOPIFY_API_KEY',
    'CORE_AI_SERVICE_URL',
    'CORE_AI_SERVICE_API_KEY',
    'BACKEND_API_URL'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`Warning: Environment variable ${varName} is not set`);
    }
  }
}

validateEnvironment();

export default {
  SHOPIFY_API_KEY: getEnvVar('SHOPIFY_API_KEY'),
  SHOPIFY_API_SECRET: getEnvVar('SHOPIFY_API_SECRET'),
  SHOPIFY_APP_URL: getEnvVar('SHOPIFY_APP_URL'),
  NEXT_PUBLIC_SHOPIFY_API_KEY: getEnvVar('NEXT_PUBLIC_SHOPIFY_API_KEY'),
  CORE_AI_SERVICE_URL: getEnvVar('CORE_AI_SERVICE_URL'),
  CORE_AI_SERVICE_API_KEY: getEnvVar('CORE_AI_SERVICE_API_KEY'),
  BACKEND_API_URL: getEnvVar('BACKEND_API_URL'),
  DATABASE_URL: getOptionalEnvVar('DATABASE_URL'),
  DB_USER: getOptionalEnvVar('DB_USER', 'postgres'),
  DB_HOST: getOptionalEnvVar('DB_HOST', 'localhost'),
  DB_NAME: getOptionalEnvVar('DB_NAME', 'yona_marketing'),
  DB_PASSWORD: getOptionalEnvVar('DB_PASSWORD', 'postgres'),
  DB_PORT: getOptionalEnvVar('DB_PORT', '5432'),
  NODE_ENV: getOptionalEnvVar('NODE_ENV', 'development'),
};