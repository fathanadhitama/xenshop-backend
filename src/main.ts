import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const whitelistUrls: any[] = (
    process.env.APP_WHITELIST || 'http://localhost:3000'
  ).split(',');
  const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || whitelistUrls.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  };
  app.enableCors(corsOptions);

  await app.listen(process.env.PORT || process.env.APP_PORT || 3001);
}
bootstrap();
