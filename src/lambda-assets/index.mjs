import { Migrate } from '@prisma/migrate'

/**
 * Runs prisma migrations in lambda function using prisma Migrate class
 *
 * @see https://github.com/prisma/prisma/blob/main/packages/migrate/src/Migrate.ts
 */
export async function handler(event) {
	const migrate = new Migrate('schema.prisma')
	// this is what runs in "prisma migrate deploy"
	const result = await migrate.applyMigrations()
	return {
		statusCode: 200,
		message: JSON.stringify(result, null, 2),
	}
}
