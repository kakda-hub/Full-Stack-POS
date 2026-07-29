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
  // Swagger UI injects inline <script> tags (customJsStr), so allow 'unsafe-inline'
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
      },
    },
  }));
  // ─── CORS ──────────────────────────────────────────────────────────────────
  // Restrict origins to the production Vercel domain and all Vercel preview
  // subdomains so preview deployments can call the API.
  // Override via FRONTEND_URL env var for a single specific origin if needed.
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? [process.env.FRONTEND_URL, /\.vercel\.app$/]
      : [
          'https://full-stack-ggqlc56hj-full-stack-pos.vercel.app',
          /\.vercel\.app$/,
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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

  // Inline JS that auto-authorizes Swagger UI.
  // Priority order:
  //   1. localStorage (frontend's pos_user session or raw accessToken)
  //   2. Cookie (access_token)
  //   3. DOM MutationObserver (watches API responses rendered in <pre> elements)
  //
  // The DOM observer approach works regardless of how Swagger UI makes HTTP
  // requests (fetch, XHR, swagger-client, etc.).
  const autoAuthScript = `
(function() {
  var authorized = false;
  var observer = null;

  // ── Core: feed a token into Swagger UI's Bearer auth ──────────────
  function doAuthorize(token) {
    if (!token || authorized || !window.ui || !window.ui.authActions) return false;
    // Swagger UI auto-prepends 'Bearer ' for http/bearer schemes
    window.ui.authActions.authorize({
      bearer: {
        name: 'bearer',
        value: token,
        schema: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    });
    authorized = true;
    if (observer) observer.disconnect();
    return true;
  }

  // ── Source 1: localStorage ─────────────────────────────────────────
  // Picks up the frontend's existing user session (pos_user.token)
  // or a raw accessToken key stored by other means.
  function getTokenFromStorage() {
    try {
      var stored = localStorage.getItem('pos_user');
      if (stored) {
        var user = JSON.parse(stored);
        if (user && user.token) return user.token;
      }
      var raw = localStorage.getItem('accessToken');
      if (raw) return raw;
    } catch (e) {}
    return null;
  }

  // ── Source 2: Cookie ───────────────────────────────────────────────
  function getTokenFromCookie() {
    try {
      var match = document.cookie.match(/access_token=([^;]+)/);
      if (match) return match[1];
    } catch (e) {}
    return null;
  }

  // ── Source 3: DOM observer (catches Swagger login responses) ───────
  function tryAuthorizeFromText(text) {
    if (authorized) return true;
    try {
      var obj = JSON.parse(text);
      var token = obj && (obj.accessToken || (obj.data && obj.data.accessToken));
      if (token && doAuthorize(token)) {
        console.log('[Swagger] ✅ Auto-authorized via DOM observer');
        return true;
      }
    } catch (e) {}
    return false;
  }

  observer = new MutationObserver(function() {
    if (authorized) return;
    // Swagger UI renders response JSON in <pre> elements
    var pres = document.querySelectorAll('pre');
    for (var i = 0; i < pres.length; i++) {
      var text = pres[i].textContent || '';
      if (text.indexOf('accessToken') !== -1) {
        if (tryAuthorizeFromText(text)) return;
      }
    }
  });

  function init() {
    if (!window.ui || !window.ui.authActions) {
      setTimeout(init, 300);
      return;
    }

    // 1. Try localStorage (frontend's existing session)
    var storageToken = getTokenFromStorage();
    if (storageToken && doAuthorize(storageToken)) {
      console.log('[Swagger] ✅ Auto-authorized via localStorage (frontend session)');
      return;
    }

    // 2. Try cookie
    var cookieToken = getTokenFromCookie();
    if (cookieToken && doAuthorize(cookieToken)) {
      console.log('[Swagger] ✅ Auto-authorized via cookie');
      return;
    }

    // 3. Fall back to DOM observer (catches login-on-the-fly)
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Swagger] ✅ Auto-auth DOM observer active');
  }
  init();
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

  // console.log(`🚀 POS API Contenting to TiDB Cloud`);
  console.log(`🚀 POS API running on: http://localhost:${port}/api/v1`);
  console.log(`📦 Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();
