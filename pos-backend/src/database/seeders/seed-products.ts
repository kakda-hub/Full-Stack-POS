/**
 * Product Seed Script
 *
 * Seeds the `products` table with 20 sample products across the 4 existing
 * categories (Beverages, Food, Snacks, Dairy).
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/seed/seed-products.ts
 *
 * Or via npm (after adding the script):
 *   npm run seed:products
 *
 * Prerequisites:
 *   - Database must be running and migrated (categories must exist)
 *   - .env file or environment variables must be configured
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { buildEnvDbOptions } from '../../config/db-options';

dotenv.config();

interface ProductSeed {
  name: string;
  nameKh: string;
  barcode: string;
  price: number;
  stock: number;
  categoryId: number;
  description?: string;
  imgUrl?: string;
}

const products: ProductSeed[] = [
  // ── Beverages (categoryId: 1) ─────────────────────────────────────────────
  {
    name: 'Coca Cola',
    nameKh: 'កូកាកូឡា',
    barcode: '8850000010002',
    price: 1.50,
    stock: 100,
    categoryId: 1,
    description: 'Carbonated soft drink, 355ml can',
    imgUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200',
  },
  {
    name: 'Pepsi',
    nameKh: 'ប៉ិបស៊ី',
    barcode: '8850000020001',
    price: 1.50,
    stock: 90,
    categoryId: 1,
    description: 'Carbonated cola drink, 355ml can',
    imgUrl: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=200',
  },
  {
    name: 'Bottled Water',
    nameKh: 'ទឹកបរិសុទ្ធ',
    barcode: '8850000030000',
    price: 0.80,
    stock: 200,
    categoryId: 1,
    description: 'Natural spring water, 500ml bottle',
    imgUrl: 'https://images.unsplash.com/photo-1560023907-5f3394ea0a82?w=200',
  },
  {
    name: 'Orange Juice',
    nameKh: 'ទឹកក្រូច',
    barcode: '8850000040009',
    price: 2.00,
    stock: 45,
    categoryId: 1,
    description: 'Fresh squeezed orange juice, 250ml pack',
    imgUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200',
  },
  {
    name: 'Iced Tea',
    nameKh: 'តែទឹកកក',
    barcode: '8850000050008',
    price: 1.75,
    stock: 60,
    categoryId: 1,
    description: 'Lemon flavored iced tea, 330ml can',
  },

  // ── Food (categoryId: 2) ──────────────────────────────────────────────────
  {
    name: 'Chicken Rice',
    nameKh: 'បាយសាច់មាន់',
    barcode: '8850000060007',
    price: 4.50,
    stock: 30,
    categoryId: 2,
    description: 'Steamed chicken with fragrant rice and dipping sauce',
  },
  {
    name: 'Beef Noodle Soup',
    nameKh: 'គុយទាវសាច់គោ',
    barcode: '8850000070006',
    price: 5.00,
    stock: 25,
    categoryId: 2,
    description: 'Traditional beef noodle soup with fresh herbs',
  },
  {
    name: 'Fried Rice',
    nameKh: 'បាយឆា',
    barcode: '8850000080005',
    price: 3.50,
    stock: 40,
    categoryId: 2,
    description: 'Wok-fried rice with vegetables and egg',
  },
  {
    name: 'Pad Thai',
    nameKh: 'ប៉ាដ់ថៃ',
    barcode: '8850000090004',
    price: 4.00,
    stock: 20,
    categoryId: 2,
    description: 'Stir-fried rice noodles with shrimp and peanuts',
  },
  {
    name: 'Grilled Pork',
    nameKh: 'សាច់ជ្រូកអាំង',
    barcode: '8850000100000',
    price: 3.75,
    stock: 15,
    categoryId: 2,
    description: 'Marinated grilled pork served with sticky rice',
  },

  // ── Snacks (categoryId: 3) ────────────────────────────────────────────────
  {
    name: 'Potato Chips',
    nameKh: 'បន្ទះស្រូវ',
    barcode: '8850000110009',
    price: 1.25,
    stock: 80,
    categoryId: 3,
    description: 'Crispy salted potato chips, 80g pack',
  },
  {
    name: 'Chocolate Bar',
    nameKh: 'សូកូឡា',
    barcode: '8850000120008',
    price: 2.00,
    stock: 65,
    categoryId: 3,
    description: 'Milk chocolate bar with almonds, 100g',
  },
  {
    name: 'Mixed Nuts',
    nameKh: 'គ្រាប់ធញ្ញជាតិ',
    barcode: '8850000130007',
    price: 3.00,
    stock: 35,
    categoryId: 3,
    description: 'Roasted mixed nuts, 150g pack',
  },
  {
    name: 'Cookies',
    nameKh: 'ខូគី',
    barcode: '8850000140006',
    price: 1.50,
    stock: 55,
    categoryId: 3,
    description: 'Butter cookies with chocolate chips, 120g',
  },
  {
    name: 'Candy Pack',
    nameKh: 'ស្ករគ្រាប់',
    barcode: '8850000150005',
    price: 0.75,
    stock: 100,
    categoryId: 3,
    description: 'Assorted fruit candies, 200g pack',
  },

  // ── Dairy (categoryId: 4) ─────────────────────────────────────────────────
  {
    name: 'Fresh Milk',
    nameKh: 'ទឹកដោះគោស្រស់',
    barcode: '8850000160004',
    price: 2.50,
    stock: 40,
    categoryId: 4,
    description: 'Pasteurized fresh milk, 1 liter carton',
    imgUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200',
  },
  {
    name: 'Yogurt',
    nameKh: 'ទឹកដោះគោជូរ',
    barcode: '8850000170003',
    price: 1.50,
    stock: 50,
    categoryId: 4,
    description: 'Strawberry flavored yogurt, 180ml cup',
  },
  {
    name: 'Cheese Block',
    nameKh: 'ឈីស',
    barcode: '8850000180002',
    price: 4.00,
    stock: 25,
    categoryId: 4,
    description: 'Cheddar cheese block, 200g',
  },
  {
    name: 'Butter',
    nameKh: 'ប៊ឺ',
    barcode: '8850000190001',
    price: 2.25,
    stock: 30,
    categoryId: 4,
    description: 'Unsalted butter, 250g block',
  },
  {
    name: 'Ice Cream',
    nameKh: 'ការ៉េម',
    barcode: '8850000200007',
    price: 3.00,
    stock: 20,
    categoryId: 4,
    description: 'Vanilla ice cream, 500ml tub',
    imgUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200',
  },
];

async function seed() {
  console.log('🌱 Starting product seed...\n');

  // Build a temporary DataSource using the same env vars as the app.
  // This keeps the script portable — no need to import the app module.
  const dataSource = new DataSource({
    ...buildEnvDbOptions(),

    extra: {
      connectionLimit: 2,
      charset: 'utf8mb4',
    },
  });

  await dataSource.initialize();
  console.log('✅ Database connected\n');

  try {
    // Verify categories exist (foreign key prerequisite)
    const catCount = await dataSource.query(`SELECT COUNT(*) AS cnt FROM categories`);
    if (Number(catCount[0].cnt) === 0) {
      console.error('❌ No categories found. Run migrations first: npm run migration:run');
      process.exit(1);
    }
    console.log(`📁 Found ${catCount[0].cnt} categories\n`);

    let inserted = 0;
    let skipped = 0;

    for (const p of products) {
      // Check if barcode already exists (idempotent)
      const existing = await dataSource.query(
        `SELECT id FROM products WHERE barcode = ?`,
        [p.barcode],
      );

      if (existing.length > 0) {
        console.log(`  ⏭  SKIP   ${p.barcode} — "${p.name}" already exists`);
        skipped++;
        continue;
      }

      await dataSource.query(
        `INSERT INTO products (name, name_kh, barcode, price, stock, category_id, description, img_url, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
        [
          p.name,
          p.nameKh,
          p.barcode,
          p.price,
          p.stock,
          p.categoryId,
          p.description || null,
          p.imgUrl || null,
        ],
      );

      console.log(`  ✅ SEED   ${p.barcode} — "${p.name}" ($${p.price.toFixed(2)})`);
      inserted++;
    }

    console.log(`\n📊 Summary: ${inserted} inserted, ${skipped} skipped`);
  } catch (err) {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔒 Connection closed\n');
  }
}

seed();
