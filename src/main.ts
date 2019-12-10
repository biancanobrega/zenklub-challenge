// tslint:disable-next-line: no-var-requires
require('module-alias/register');
import { ConfigService } from '@config/config.service';
import { EnvConfig } from '@config/enums/config.enum';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@shared/filters/error.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  const configService: ConfigService = app.get(ConfigService);
  const port = process.env.PORT || configService.getEnvConfig(EnvConfig.Port);
  const host = configService.getEnvConfig(EnvConfig.Host);

  SwaggerModule.setup(
    `v1/professionals/docs`,
    app,
    createSwaggerDocument(app, `${host}:${port}`, '1.0')
  );

  app.enableCors();

  await app.listen(configService.getEnvConfig(EnvConfig.Port));
  logger.log(
    `App is running at http://${host}:${port} in ${process.env.NODE_ENV} mode`
  );
}

const createSwaggerBaseConfig = (host: string, version: string) =>
  new DocumentBuilder()
    .setTitle('Professionals')
    .setDescription('')
    .setVersion(version)
    .addTag('professionals')
    .setHost(host)
    .build();

const createSwaggerDocument = (
  app: INestApplication,
  host: string,
  version: string
) => SwaggerModule.createDocument(app, createSwaggerBaseConfig(host, version));

bootstrap();
