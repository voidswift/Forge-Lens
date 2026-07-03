import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as usersSchema from './schemas/users';
import * as repositoriesSchema from './schemas/repositories';
import * as commitsSchema from './schemas/commits';
import * as pullRequestsSchema from './schemas/pull_requests';
import * as contributorsSchema from './schemas/contributors';

const schema = {
  ...usersSchema,
  ...repositoriesSchema,
  ...commitsSchema,
  ...pullRequestsSchema,
  ...contributorsSchema,
};

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });
export * from './schemas/users';
export * from './schemas/repositories';
export * from './schemas/commits';
export * from './schemas/pull_requests';
export * from './schemas/contributors';
