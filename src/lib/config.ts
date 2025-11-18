// Centralized environment configuration with validation
// All environment variable access should go through this module

interface EnvConfig {
  // Firebase Client
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  // Firebase Admin (server-side only)
  firebaseAdmin?: {
    credentials: string;
  };
  // Payment Integration
  whop: {
    webhookSecret?: string;
  };
  // Automation
  n8n: {
    webhookUrl?: string;
    apiKey?: string;
  };
  // Notifications
  notifications: {
    enabled: boolean;
    slackWebhookUrl?: string;
    discordWebhookUrl?: string;
  };
}

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function getEnvVar(key: string, required: boolean = true): string | undefined {
  const value = process.env[key];
  
  if (required && !value) {
    throw new ConfigError(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env.local file against .env.schema.json`
    );
  }
  
  return value;
}

function validateConfig(): EnvConfig {
  // Required Firebase client vars
  const firebase = {
    apiKey: getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY")!,
    authDomain: getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")!,
    projectId: getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID")!,
    storageBucket: getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET")!,
    messagingSenderId: getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID")!,
    appId: getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID")!,
  };

  // Optional Firebase admin
  const firebaseAdminCreds = getEnvVar("FIREBASE_ADMIN_CREDENTIALS", false);
  const firebaseAdmin = firebaseAdminCreds ? { credentials: firebaseAdminCreds } : undefined;

  // Whop config
  const whop = {
    webhookSecret: getEnvVar("WHOP_WEBHOOK_SECRET", false),
  };

  // N8N config
  const n8n = {
    webhookUrl: getEnvVar("N8N_WEBHOOK_URL", false),
    apiKey: getEnvVar("N8N_API_KEY", false),
  };

  // Notifications
  const notificationsEnabled = getEnvVar("ENABLE_WEBHOOK_NOTIFICATIONS", false) === "true";
  const notifications = {
    enabled: notificationsEnabled,
    slackWebhookUrl: getEnvVar("SLACK_WEBHOOK_URL", false),
    discordWebhookUrl: getEnvVar("DISCORD_WEBHOOK_URL", false),
  };

  return {
    firebase,
    firebaseAdmin,
    whop,
    n8n,
    notifications,
  };
}

// Validate and freeze config on module load
let config: EnvConfig;

try {
  config = validateConfig();
  Object.freeze(config);
} catch (error) {
  if (error instanceof ConfigError) {
    console.error("\n CONFIGURATION ERROR:");
    console.error(error.message);
    console.error("\nApplication cannot start with invalid configuration.\n");
    throw error;
  }
  throw error;
}

export { config, ConfigError };
export type { EnvConfig };
