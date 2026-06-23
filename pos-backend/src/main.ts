import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, SwaggerCustomOptions } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ─── Security ───────────────────────────────────────────────────────────────
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Global Prefix ──────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global Pipes ───────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global Filters ─────────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ─── Global Interceptors ────────────────────────────────────────────────────
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  // ─── Swagger Documentation ──────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('POS API')
    .setDescription('The POS system API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Inline JS that auto-authorizes Swagger UI after a successful login
  const autoAuthScript = `
(function() {
  // Wait for Swagger UI to be fully initialized (window.ui exposed)
  var checkUI = setInterval(function() {
    if (window.ui && window.ui.authActions) {
      clearInterval(checkUI);

      // Intercept fetch to catch login responses and auto-authorize
      var origFetch = window.fetch;
      window.fetch = function() {
        var url = arguments[0];
        return origFetch.apply(this, arguments).then(function(response) {
          if (typeof url === 'string' && url.includes('/auth/login') && response.ok) {
            response.clone().json().then(function(data) {
              // Handle both wrapped (with interceptor) and unwrapped responses
              var token = data.accessToken || (data.data && data.data.accessToken);
              if (token) {
                window.ui.authActions.authorize({
                  bearer: {
                    name: 'bearer',
                    value: 'Bearer ' + token,
                    schema: {
                      type: 'http',
                      scheme: 'bearer',
                      bearerFormat: 'JWT'
                    }
                  }
                });
                console.log('[Swagger] ✅ Auto-authorized with JWT token');
              }
            }).catch(function() {});
          }
          return response;
        });
      };
    }
  }, 200);
})();`;

  const swaggerCustomOptions: SwaggerCustomOptions = {
    customJsStr: autoAuthScript,
    customSiteTitle: 'POS API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  };

  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);

  // ─── Start ──────────────────────────────────────────────────────────────────
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`🚀 POS API running on: http://localhost:${port}/api/v1`);
  console.log(`📦 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();
