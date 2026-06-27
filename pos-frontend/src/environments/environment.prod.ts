/**
 * Production environment configuration.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  IMPORTANT: Update `apiUrl` to your actual Render.com backend URL
 *  before deploying (e.g., https://pos-backend.onrender.com).
 * ═══════════════════════════════════════════════════════════════════
 */
export const environment = {
  production: true,
  apiUrl: '', // Uses Vercel rewrites to proxy /api/v1/* to Render
};
