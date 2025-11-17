import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import * as dotenv from 'dotenv';

const ajv = new Ajv({ allErrors: true });

interface SchemaProperty {
  type?: string;
  description?: string;
  pattern?: string;
  minLength?: number;
  enum?: string[];
  default?: string | number | boolean;
}

interface EnvSchema {
  required?: string[];
  properties?: Record<string, SchemaProperty>;
}

// Load .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found');
  console.log('   Create a .env.local file with required environment variables');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Load schema
const schemaPath = path.resolve(process.cwd(), '.env.schema.json');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: .env.schema.json file not found');
  process.exit(1);
}

const schema: EnvSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

// Convert process.env to a plain object for validation
const envData: Record<string, string> = {};
Object.keys(process.env).forEach((key) => {
  if (process.env[key] !== undefined) {
    envData[key] = process.env[key] as string;
  }
});

// Validate
const validate = ajv.compile(schema);
const valid = validate(envData);

if (!valid) {
  console.error('❌ Environment validation failed:\n');
  
  if (validate.errors) {
    validate.errors.forEach((error) => {
      if (error.keyword === 'required') {
        const missingProp = error.params.missingProperty;
        const propSchema = schema.properties?.[missingProp];
        console.error(`  Missing required variable: ${missingProp}`);
        if (propSchema?.description) {
          console.error(`    ${propSchema.description}`);
        }
      } else {
        console.error(`  ${error.instancePath || 'root'}: ${error.message}`);
        if (error.keyword === 'pattern' && error.params.pattern) {
          console.error(`    Expected pattern: ${error.params.pattern}`);
        }
      }
    });
  }
  
  console.error('\nPlease check your .env.local file and try again.');
  process.exit(1);
}

console.log('✅ Environment variables validated successfully');

// List all required variables
if (schema.required && schema.required.length > 0) {
  console.log(`\n📋 Required variables (${schema.required.length}):`);
  schema.required.forEach((key) => {
    const value = envData[key];
    const masked = value ? `${value.substring(0, 4)}...` : '❌ NOT SET';
    console.log(`   ${key}: ${masked}`);
  });
}
