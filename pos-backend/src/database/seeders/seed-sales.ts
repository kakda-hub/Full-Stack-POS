/**
 * Sales Seed Script
 *
 * Seeds the `sales` and `sale_items` tables with 20 sample transactions
 * spread over the past 30 days, using the seeded products (IDs 1-20)
 * and default users (admin=1, cashier=2).
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/seed/seed-sales.ts
 *
 * Or via npm:
 *   npm run seed:sales
 *
 * Prerequisites:
 *   - Database must be running and migrated
 *   - Products must be seeded first (npm run seed:products)
 *   - .env file or environment variables must be configured
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Return a random integer in [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Return an ISO date string N days ago at a random hour */
function daysAgo(days: number, hourOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(7 + hourOffset, randInt(0, 59), randInt(0, 59), 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// ── Transaction definitions ───────────────────────────────────────────────────
// Each transaction: userId, paymentMethod, daysAgo, and items [productId, qty]

interface SaleSeedItem {
  productId: number;
  quantity: number;
  price: number;
}

interface SaleSeed {
  userId: number;
  paymentMethod: 'cash' | 'aba' | 'card';
  daysAgo: number;
  hourOffset: number;
  items: { productId: number; qty: number }[];
}

// Product prices (copy of the seeded product data for price snapshot)
const productPrices: Record<number, number> = {
  1: 1.50, 2: 1.50, 3: 0.80, 4: 2.00, 5: 1.75,
  6: 4.50, 7: 5.00, 8: 3.50, 9: 4.00, 10: 3.75,
  11: 1.25, 12: 2.00, 13: 3.00, 14: 1.50, 15: 0.75,
  16: 2.50, 17: 1.50, 18: 4.00, 19: 2.25, 20: 3.00,
};

const sales: SaleSeed[] = [
  // ── Recent transactions (0-7 days ago) ───────────────────────────────────
  {
    userId: 2, paymentMethod: 'cash', daysAgo: 0, hourOffset: 0,
    items: [{ productId: 1, qty: 2 }, { productId: 6, qty: 1 }, { productId: 11, qty: 1 }],
  },
  {
    userId: 2, paymentMethod: 'aba', daysAgo: 0, hourOffset: 2,
    items: [{ productId: 3, qty: 3 }, { productId: 16, qty: 1 }],
  },
  {
    userId: 1, paymentMethod: 'card', daysAgo: 1, hourOffset: 0,
    items: [{ productId: 7, qty: 2 }, { productId: 9, qty: 1 }, { productId: 4, qty: 2 }],
  },
  {
    userId: 2, paymentMethod: 'cash', daysAgo: 1, hourOffset: 3,
    items: [{ productId: 8, qty: 1 }, { productId: 12, qty: 3 }],
  },
  {
    userId: 2, paymentMethod: 'aba', daysAgo: 2, hourOffset: 1,
    items: [{ productId: 2, qty: 4 }, { productId: 14, qty: 2 }, { productId: 20, qty: 1 }],
  },
  {
    userId: 1, paymentMethod: 'cash', daysAgo: 2, hourOffset: 4,
    items: [{ productId: 10, qty: 2 }, { productId: 17, qty: 3 }],
  },

  // ── Mid-range transactions (8-16 days ago) ────────────────────────────────
  {
    userId: 2, paymentMethod: 'card', daysAgo: 8, hourOffset: 0,
    items: [{ productId: 5, qty: 1 }, { productId: 13, qty: 2 }, { productId: 18, qty: 1 }, { productId: 1, qty: 2 }],
  },
  {
    userId: 2, paymentMethod: 'aba', daysAgo: 9, hourOffset: 2,
    items: [{ productId: 6, qty: 1 }, { productId: 15, qty: 5 }],
  },
  {
    userId: 1, paymentMethod: 'cash', daysAgo: 10, hourOffset: 1,
    items: [{ productId: 3, qty: 6 }, { productId: 19, qty: 2 }],
  },
  {
    userId: 2, paymentMethod: 'cash', daysAgo: 11, hourOffset: 3,
    items: [{ productId: 9, qty: 2 }, { productId: 11, qty: 3 }, { productId: 4, qty: 1 }],
  },
  {
    userId: 2, paymentMethod: 'aba', daysAgo: 12, hourOffset: 0,
    items: [{ productId: 16, qty: 2 }, { productId: 8, qty: 1 }],
  },
  {
    userId: 1, paymentMethod: 'card', daysAgo: 14, hourOffset: 2,
    items: [{ productId: 2, qty: 3 }, { productId: 7, qty: 1 }, { productId: 12, qty: 2 }],
  },
  {
    userId: 2, paymentMethod: 'cash', daysAgo: 15, hourOffset: 1,
    items: [{ productId: 20, qty: 2 }, { productId: 13, qty: 1 }, { productId: 5, qty: 1 }],
  },

  // ── Older transactions (17-30 days ago) ──────────────────────────────────
  {
    userId: 1, paymentMethod: 'aba', daysAgo: 17, hourOffset: 0,
    items: [{ productId: 10, qty: 3 }, { productId: 1, qty: 5 }],
  },
  {
    userId: 2, paymentMethod: 'cash', daysAgo: 18, hourOffset: 3,
    items: [{ productId: 14, qty: 4 }, { productId: 6, qty: 2 }],
  },
  {
    userId: 2, paymentMethod: 'card', daysAgo: 20, hourOffset: 1,
    items: [{ productId: 17, qty: 3 }, { productId: 3, qty: 4 }, { productId: 8, qty: 1 }],
  },
  {
    userId: 1, paymentMethod: 'aba', daysAgo: 22, hourOffset: 2,
    items: [{ productId: 4, qty: 2 }, { productId: 19, qty: 1 }, { productId: 11, qty: 2 }],
  },
  {
    userId: 2, paymentMethod: 'cash', daysAgo: 24, hourOffset: 0,
    items: [{ productId: 15, qty: 6 }, { productId: 9, qty: 1 }],
  },
  {
    userId: 2, paymentMethod: 'aba', daysAgo: 26, hourOffset: 3,
    items: [{ productId: 18, qty: 1 }, { productId: 2, qty: 2 }, { productId: 12, qty: 1 }, { productId: 7, qty: 1 }],
  },
  {
    userId: 1, paymentMethod: 'cash', daysAgo: 28, hourOffset: 1,
    items: [{ productId: 5, qty: 2 }, { productId: 13, qty: 1 }, { productId: 16, qty: 2 }],
  },
  {
    userId: 2, paymentMethod: 'card', daysAgo: 30, hourOffset: 2,
    items: [{ productId: 1, qty: 1 }, { productId: 20, qty: 2 }],
  },
];

async function seed() {
  console.log('🧾 Starting sales seed...\n');

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'root',
    password:
      process.env.DB_PASSWORD ||
      process.env.DATABASE_PASSWORD ||
      process.env.MYSQL_PASSWORD ||
      '',
    database: process.env.DB_NAME || 'pos_db',
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    extra: {
      connectionLimit: 2,
      charset: 'utf8mb4',
    },
  });

  await dataSource.initialize();
  console.log('✅ Database connected\n');

  try {
    // ── Prerequisite checks ──────────────────────────────────────────────
    const userCount = await dataSource.query(
      `SELECT COUNT(*) AS cnt FROM users WHERE role IN ('admin', 'cashier')`,
    );
    if (Number(userCount[0].cnt) === 0) {
      console.error('❌ No users found. Run migrations first: npm run migration:run');
      process.exit(1);
    }
    console.log(`👤 Found ${userCount[0].cnt} users`);

    const productCount = await dataSource.query(
      `SELECT COUNT(*) AS cnt FROM products WHERE is_active = 1`,
    );
    if (Number(productCount[0].cnt) === 0) {
      console.error('❌ No products found. Run seed:products first');
      process.exit(1);
    }
    console.log(`📦 Found ${productCount[0].cnt} active products\n`);

    // ── Fetch last sale ID for idempotency check ─────────────────────────
    const lastSale = await dataSource.query(
      `SELECT MAX(id) AS max_id FROM sales`,
    );
    const existingSaleCount = lastSale[0]?.max_id ?? 0;
    console.log(`📊 Existing sales: ${existingSaleCount}\n`);

    // ── Insert sales ─────────────────────────────────────────────────────
    let inserted = 0;
    let skipped = 0;

    for (const sale of sales) {
      const saleDate = daysAgo(sale.daysAgo, sale.hourOffset);

      // Calculate financials
      const saleItems: SaleSeedItem[] = sale.items.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        price: productPrices[item.productId] ?? 0,
      }));
      const subtotal = saleItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const discount = Math.round(subtotal * pick([0, 0, 0, 0.05, 0.1]) * 100) / 100;
      const tax = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
      const total = Math.round((subtotal - discount + tax) * 100) / 100;

      // Idempotency: use a checksum-like condition based on date + total + userId
      // This prevents duplicates if the script is re-run
      const existing = await dataSource.query(
        `SELECT id FROM sales WHERE created_at = ? AND total = ? AND user_id = ?`,
        [saleDate, total, sale.userId],
      );

      if (existing.length > 0) {
        console.log(`  ⏭  SKIP   Sale #${existing[0].id} (${saleDate})`);
        skipped++;
        continue;
      }

      // Insert sale
      const saleResult = await dataSource.query(
        `INSERT INTO sales (user_id, subtotal, discount, tax, total, payment_method, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sale.userId, subtotal, discount, tax, total, sale.paymentMethod, saleDate],
      );
      const saleId = saleResult.insertId;

      // Insert sale items
      for (const item of saleItems) {
        await dataSource.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [saleId, item.productId, item.quantity, item.price],
        );
      }

      const methodEmoji: Record<string, string> = {
        cash: '💵', aba: '📱', card: '💳',
      };
      console.log(
        `  ✅ SALE #${saleId}  ${methodEmoji[sale.paymentMethod]} ` +
        `$${total.toFixed(2)}  (${saleItems.length} items)  ${saleDate}`,
      );
      inserted++;
    }

    console.log(`\n📊 Summary: ${inserted} sales inserted, ${skipped} skipped`);
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔒 Connection closed\n');
  }
}

seed();
