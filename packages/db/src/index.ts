import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as usersSchema from './schemas/users';
import * as repositoriesSchema from './schemas/repositories';

const schema = {
  ...usersSchema,
  ...repositoriesSchema,
};

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export * from './schemas/users';
export * from './schemas/repositories';
