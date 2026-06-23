<!-- សាកល្បងតេស្ត URL ទាំងនេះ (ដោយប្រើ Token ខាងលើ)៖

GET http://localhost:3000/api/v1/products (មើលទំនិញ)
GET http://localhost:3000/api/v1/categories (មើលប្រភេទក្រុមទំនិញ)
GET http://localhost:3000/api/v1/sales (មើលការលក់)
GET http://localhost:3000/api/v1/auth/profile (មើលព័ត៌មាន User ខ្លួនឯង) -->

<!-- docker-compose up -d --build backend frontend -->

<!-- Can you provide your correct Cloudinary API secret? You can find it by:

Log into https://console.cloudinary.com
Go to Settings → API Keys
Copy the API Secret for key 672462659274597 -->


<!-- All 4 Docker containers are still running healthily after the local build:
┌─────────────────────┬─────────────────────┬───────────┬───────────┐
│ Container           │ Image               │ Status    │ Ports     │
├─────────────────────┼─────────────────────┼───────────┼───────────┤
│ projectpos-backend  │ projectpos-backend  │ Up 16 min │ 3000      │
│ projectpos-frontend │ projectpos-frontend │ Up 16 min │ 4200      │
│ projectpos-mysql    │ mysql:8             │ Up 16 min │ 3306      │
│ projectpos-minio    │ minio/minio         │ Up 16 min │ 9000-9001 │
└─────────────────────┴─────────────────────┴───────────┴───────────┘
No issues — the local  npm install  /  npm run build  didn't affect Docker at all. -->

<!-- The local backend dev server is running and the API is working. Here are the test results:
Login API Test — ✅ Passed
┌─────────────┬───────────────────────────────────────────────────────────────────────┐
│ Check       │ Result                                                                │
├─────────────┼───────────────────────────────────────────────────────────────────────┤
│ HTTP Status │ 201 Created                                                           │
│ accessToken │ ✅ Valid JWT token returned                                           │
│ user data   │ ✅ id: 1, name: "System Admin", email: "admin@pos.com", role: "admin" │
└─────────────┴───────────────────────────────────────────────────────────────────────┘ -->


<!-- Note:  -->

<!-- docker-compose down
docker-compose up -d --build -->

<!-- ជាទូទៅ នៅក្នុងការ Setup តាមរយៈ docker-compose.yml របស់អ្នក បើអ្នកគ្រាន់តែកែប្រែ ឬបន្ថែម Code ធម្មតាៗនៅក្នុង Folder src (ទាំង Backend និង Frontend) អ្នកមិនចាំបាច់ Re-build Docker ទេ ព្រោះវាមានមុខងារ Hot-Reload ស្រាប់ (ដោយសារមានការប្រើប្រាស់ Volume Mount និងរត់ command start:dev ឬ ng serve)។

ប៉ុន្តែ ប្រសិនបើអ្នកមានការ ដំឡើង Package ថ្មី (npm install) ឬចង់ឱ្យប្រាកដថា Docker ចាប់យកការ Update ចុងក្រោយទាំងអស់ (Clean Build) អ្នកត្រូវរត់ Command នេះដើម្បី Re-build Docker containers របស់អ្នកឡើងវិញ៖
សូមបើក Terminal នៅក្នុង Folder Project POS (កន្លែងដែលមាន file docker-compose.yml) រួចវាយ Command នេះ៖

bash

docker-compose down
docker-compose up -d --build
(ឬប្រើ docker compose បើអ្នកប្រើ Docker ជំនាន់ថ្មី)

ពន្យល់អំពី Command នេះ៖
docker-compose down: សម្រាប់បិទ និងលុប Containers ចាស់ៗចេញសិន (ដើម្បីកុំឱ្យវាមានបញ្ហាគាំង)។
docker-compose up -d --build:
--build: ជាពាក្យបញ្ជាដាច់ខាតឱ្យ Docker ធ្វើការ Build Image របស់ pos-backend និង pos-frontend ជាថ្មីម្តងទៀត (វាចាប់យក Code និង Package ថ្មីៗទាំងអស់)។
-d: (Detached mode) សម្រាប់ឱ្យវា Run ស្ងាត់ៗពីក្រោយ ដោយមិនឱ្យទាក់កន្លែង Terminal របស់អ្នក។ -->

## 🚀 Swagger Auto-Authorization

The Swagger API documentation at [http://localhost:3000/api/docs](http://localhost:3000/api/docs) includes **auto-authorization**: after a successful login, the JWT token is automatically applied to all subsequent requests — no need to manually copy tokens or click the "Authorize" button.

### How It Works

1. Open [http://localhost:3000/api/docs](http://localhost:3000/api/docs) in your browser.
2. Expand **POST** `/api/v1/auth/login`, click **Try it out**, and execute with the admin credentials:
   ```json
   { "email": "admin@pos.com", "password": "admin123" }
   ```
3. A **201** response with an `accessToken` is returned. The token is automatically detected and applied via a DOM MutationObserver.
4. The **Authorize** button at the top-right changes to indicate you're authorized (lock icon).
5. You can now call any protected endpoint (e.g., **GET** `/api/v1/users`) — they will return **200** instead of **401**.

### Technical Details

The auto-auth works by injecting a custom JavaScript snippet (`customJsStr`) into the Swagger UI page. It uses a `MutationObserver` to watch the DOM for response `<pre>` elements containing the `accessToken` field. When detected, it calls Swagger UI's `authActions.authorize()` with the raw token (Swagger UI automatically prepends the `Bearer ` prefix for `http/bearer` security schemes).

The Content Security Policy (CSP) is configured to allow inline scripts via:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      // ...
    },
  },
}));
```

### Troubleshooting

- If auto-auth doesn't trigger, you can always manually click the **Authorize** button at the top-right and paste the token as `Bearer <your-token>`.
- The `persistAuthorization: true` option saves the token across page reloads.

All protected endpoints tested successfully with the JWT token:
┌──────────────────────────────────────┬────────┐
│ Endpoint                             │ Status │
├──────────────────────────────────────┼────────┤
│ GET /api/v1/auth/profile             │ ✅ 200 │
│ GET /api/v1/products                 │ ✅ 200 │
│ GET /api/v1/categories               │ ✅ 200 │
│ GET /api/v1/sales                    │ ✅ 200 │
│ GET /api/v1/reports/summary          │ ✅ 200 │
│ GET /api/v1/reports/daily-revenue    │ ✅ 200 │
│ GET /api/v1/reports/top-products     │ ✅ 200 │
│ GET /api/v1/reports/payment-summary  │ ✅ 200 │
│ GET /api/v1/reports/sales-by-cashier │ ✅ 200 │
│ GET /api/v1/management-pages         │ ✅ 200 │
│ GET /api/v1/users                    │ ✅ 200 │
└──────────────────────────────────────┴────────┘
All 11 protected endpoints return 200 OK (or appropriate data responses). The auto-auth is working correctly across the entire API — no 401 errors.