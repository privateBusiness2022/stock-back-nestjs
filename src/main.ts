import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .addSecurity('JWT', {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Bearer ${token}',
    })
    .build();

  app.enableCors({ origin: '*' });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  /** Logging the request */
  app.use((req, res, next) => {
    console.info(
      '*',
      `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`,
    );

    res.on('finish', () => {
      console.info(
        '*',
        `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${req.statusCode}]`,
      );
    });

    next();
  });
  app.use(helmet());
  await app.listen(8081);
}
bootstrap();
