import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2'
import { Platform } from 'aws-cdk-lib/aws-ecr-assets'
import { IRole } from 'aws-cdk-lib/aws-iam'
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda'
import { IQueue } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'
import fs from 'fs'

interface PrismaLayerProps extends StackProps {
	schemaFilePath: string
	migrationsDirPath: string
	/** directory with the lambda Dockerfile */
	lambdaAssetsDirPath: string
	dbUrl: string
	role?: IRole
	/** VPC That the database is in */
	vpc?: IVpc
	/** Security group that can access the database */
	securityGroups?: ISecurityGroup[]
	/** Queue for failed messages. This will tell you if it did not execute because of things like permission errors */
	deadLetterQueue?: IQueue
}

/**
 * Installs prisma and runs migrations on database. modify to your needs.
 *
 * add .lambda-migrations and .lambda-schema.prisma to .gitignore. they
 * will be copied to the lambda assets directory
 */
export class PrismaMigrationStack extends Stack {
	constructor(scope: Construct, id: string, props: PrismaLayerProps) {
		super(scope, id, props)
		const {
			dbUrl,
			lambdaAssetsDirPath,
			migrationsDirPath,
			schemaFilePath,
			vpc,
			role,
			securityGroups,
			deadLetterQueue,
		} = props

		// copy migration assets to add to docker image
		fs.copyFileSync(schemaFilePath, `${lambdaAssetsDirPath}/.lambda-schema.prisma`)
		fs.cpSync(migrationsDirPath, `${lambdaAssetsDirPath}/.lambda-migrations`, { recursive: true })

		// create lambda function
		new DockerImageFunction(this, 'PrismaDatabaseMigration', {
			description: 'Runs prisma migrations on database',
			functionName: 'PrismaDatabaseMigration',
			allowPublicSubnet: true,
			environment: {
				DATABASE_URL: dbUrl,
			},
			timeout: Duration.seconds(120),
			code: DockerImageCode.fromImageAsset(lambdaAssetsDirPath, {
				file: 'Dockerfile',
				platform: Platform.LINUX_AMD64,
			}),
			vpc,
			role,
			securityGroups,
			deadLetterQueue,
		})
	}
}
