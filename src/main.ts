import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { openAPIRouter } from './api-docs/openAPIRouter';
import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Sgroup Advanced Backend')
    .setDescription('API documentation')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);

  if (process.env.BUILD_OPENAPI === 'true') {
    fs.mkdirSync('dist', { recursive: true });
    fs.writeFileSync('dist/openapi.json', JSON.stringify(document, null, 2));
    await app.close();
    process.exit(0);
  }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`http://localhost:${process.env.PORT ?? 3000}/docs`);

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/api-docs', openAPIRouter);
}
bootstrap();
