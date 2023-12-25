# Prisma Migrate Lambda

Example stack to run prisma migrations on AWS Lambda functions using CDK.

Because you cannot create files in lambda functions outside /tmp, you cannot
run `npx prisma generate` to generate the prisma engine.

The trick is to run it in a docker container on the lambda function
using the `DockerImageFunction` class from the `aws-cdk-lib` package.

## Example

```TS
const stackPrisma = new PrismaMigrationStack(app, 'PrismaMigration', {
    dbUrl: String(process.env.DATABASE_URL),
    vpc: vpc,
    role: lambdaMigrationRole,
    securityGroups: [securityGroupDbAccess],
    migrationsDirPath: path.resolve('./', 'prisma/migrations'),
    schemaFilePath: path.resolve('./', 'prisma/schema.prisma'),
    lambdaAssetsDirPath: path.resolve(__dirname, 'lambda-assets'),
})
```
