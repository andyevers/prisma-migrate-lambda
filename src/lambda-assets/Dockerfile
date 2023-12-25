FROM public.ecr.aws/lambda/nodejs:18

# Change prisma versions to match the version in the project
RUN npm install prisma@5.6.0 @prisma/client@5.6.0 @prisma/migrate@5.6.0 && npx prisma generate

# Copy function code
COPY index.mjs .
COPY .lambda-schema.prisma schema.prisma
COPY .lambda-migrations migrations

CMD [ "index.handler" ]
