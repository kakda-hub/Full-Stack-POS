-- ═══════════════════════════════════════════════════════════════════════════════
--  Full-Stack POS System — Demo Data Seed Script
--  Target: TiDB Cloud (MySQL-compatible)
--  Executes safely with IF NOT EXISTS / ON DUPLICATE KEY patterns
--
--  Tables populated (in order):
--    1. users            6. quick_picks       11. stock_movements
--    2. categories       7. purchase_orders   12. returns
--    3. customers        8. purchase_order_items  13. return_items
--    4. suppliers        9. sales
--    5. products        10. sale_items
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Use the application database ─────────────────────────────────────────────
USE pos_db;

-- ═══════════════════════════════════════════════════════════════════════════════
--  1. USERS  (1 admin + 3 cashiers)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Passwords are bcrypt hashes (admin123 / cashier123)
INSERT IGNORE INTO users (id, name, email, password, role, is_active, created_at) VALUES
(1,  'System Admin',   'admin@pos.com',   '$2a$10$9Wzut7De2kI9N.v4P0NaOuQ52okxx2Wzp5eGcr4R5cJivjoz1BEom', 'admin',   1, NOW() - INTERVAL 90 DAY),
(2,  'Sokha Chea',     'sokha@pos.com',   '$2a$10$ymiO1NN.wCf8CZAMsatZBOD1s62KPPt7CblSnbS7xWEt3l61B5DG.', 'cashier', 1, NOW() - INTERVAL 85 DAY),
(3,  'Rattanak Phorn', 'rattanak@pos.com', '$2a$10$ymiO1NN.wCf8CZAMsatZBOD1s62KPPt7CblSnbS7xWEt3l61B5DG.', 'cashier', 1, NOW() - INTERVAL 60 DAY),
(4,  'Malis Srey',     'malis@pos.com',   '$2a$10$ymiO1NN.wCf8CZAMsatZBOD1s62KPPt7CblSnbS7xWEt3l61B5DG.', 'cashier', 1, NOW() - INTERVAL 30 DAY)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ═══════════════════════════════════════════════════════════════════════════════
--  2. CATEGORIES  (10 categories)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT IGNORE INTO categories (id, name, name_kh, description, img_url) VALUES
(1,  'Beverages',     'ភេសជ្ជៈ',       'Soft drinks, juices, water, and energy drinks',     'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200'),
(2,  'Snacks',        'អាហារសម្រន់',   'Chips, cookies, candies, and nuts',               'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200'),
(3,  'Dairy',         'ទឹកដោះគោ',     'Milk, yogurt, cheese, and butter',                'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200'),
(4,  'Bakery',        'នំប៉័ង',        'Bread, cakes, pastries, and baguettes',            'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=200'),
(5,  'Frozen Foods',  'អាហារកក',       'Ice cream, frozen vegetables, and ready meals',    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200'),
(6,  'Household',     'សម្ភារៈគ្រួសារ', 'Cleaning supplies, detergents, and disposables',  'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200'),
(7,  'Personal Care', 'គ្រឿងសម្អាង',   'Soap, shampoo, toothpaste, and deodorant',        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200'),
(8,  'Fruits',        'ផ្លែឈើ',        'Fresh fruits and dried fruits',                   'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200'),
(9,  'Vegetables',    'បន្លែ',          'Fresh vegetables and herbs',                      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1269c?w=200'),
(10, 'Instant Foods', 'អាហាររហ័ស',    'Instant noodles, canned food, and sauces',         'https://images.unsplash.com/photo-1559847844-5315695dadae?w=200')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ═══════════════════════════════════════════════════════════════════════════════
--  3. CUSTOMERS  (50 customers)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT IGNORE INTO customers (id, name, phone, email, address, total_spent, total_purchases, loyalty_points, points_per_dollar, is_active, created_at) VALUES
(1,  'Sopheap Meas',      '012345001', 'sopheap.m@email.com',   '#12, Street 110, Phnom Penh',         1250.75, 45, 1250, 10, 1, NOW() - INTERVAL 85 DAY),
(2,  'Vannak Chea',       '012345002', 'vannak.c@email.com',    '#34, Street 45, Phnom Penh',          890.50,  32, 890,  10, 1, NOW() - INTERVAL 80 DAY),
(3,  'Sreymom Kao',       '012345003', 'sreymom.k@email.com',   '#56, Street 78, Phnom Penh',          2340.00, 78, 2340, 10, 1, NOW() - INTERVAL 75 DAY),
(4,  'Bora Kim',          '012345004', 'bora.k@email.com',      '#78, Street 12, Siem Reap',           1670.25, 55, 1670, 10, 1, NOW() - INTERVAL 70 DAY),
(5,  'Chantha Sok',       '012345005', 'chantha.s@email.com',   '#90, Street 34, Battambang',          430.00,  18, 430,  10, 1, NOW() - INTERVAL 65 DAY),
(6,  'Dara Ngin',         '012345006', 'dara.n@email.com',      '#23, Street 56, Phnom Penh',          3100.50, 95, 3100, 10, 1, NOW() - INTERVAL 60 DAY),
(7,  'Srey Neang',        '012345007', 'srey.n@email.com',      '#45, Street 67, Kampot',              210.00,  8,  210,  10, 1, NOW() - INTERVAL 55 DAY),
(8,  'Sovannara Touch',   '012345008', 'sovannara.t@email.com', '#67, Street 89, Phnom Penh',          4560.75, 120, 4500, 10, 1, NOW() - INTERVAL 50 DAY),
(9,  'Reaksmey Huot',     '012345009', 'reaksmey.h@email.com',  '#89, Street 10, Phnom Penh',          780.00,  28, 780,  10, 1, NOW() - INTERVAL 45 DAY),
(10, 'Vicheka Lun',       '012345010', 'vicheka.l@email.com',   '#10, Street 23, Sihanoukville',       1950.50, 62, 1950, 10, 1, NOW() - INTERVAL 40 DAY),
(11, 'Chhaily Heang',     '012345011', 'chhaily.h@email.com',   '#32, Street 45, Phnom Penh',          3200.00, 88, 3200, 10, 1, NOW() - INTERVAL 85 DAY),
(12, 'Sokunthea Pen',     '012345012', 'sokunthea.p@email.com', '#54, Street 67, Kampong Cham',        670.25,  22, 670,  10, 1, NOW() - INTERVAL 80 DAY),
(13, 'Visal Khem',        '012345013', 'visal.k@email.com',     '#76, Street 89, Phnom Penh',          2890.00, 72, 2890, 10, 1, NOW() - INTERVAL 75 DAY),
(14, 'Sothea Yin',        '012345014', 'sothea.y@email.com',    '#98, Street 10, Pursat',              450.00,  15, 450,  10, 1, NOW() - INTERVAL 60 DAY),
(15, 'Makara Suon',       '012345015', 'makara.s@email.com',    '#11, Street 32, Phnom Penh',          5120.50, 135, 5000, 10, 1, NOW() - INTERVAL 55 DAY),
(16, 'Sopheap Tha',       '012345016', 'sopheap.t@email.com',   '#22, Street 43, Takeo',               150.00,  5,  150,  10, 1, NOW() - INTERVAL 50 DAY),
(17, 'Rithy Pok',         '012345017', 'rithy.p@email.com',     '#33, Street 54, Phnom Penh',          2100.25, 68, 2100, 10, 1, NOW() - INTERVAL 45 DAY),
(18, 'Monyneath Oung',    '012345018', 'monyneath.o@email.com', '#44, Street 65, Kampong Speu',        780.50,  25, 780,  10, 1, NOW() - INTERVAL 40 DAY),
(19, 'Sovann Panha',      '012345019', 'sovann.p@email.com',    '#55, Street 76, Phnom Penh',          3450.00, 92, 3400, 10, 1, NOW() - INTERVAL 35 DAY),
(20, 'Veasna Khieu',      '012345020', 'veasna.k@email.com',    '#66, Street 87, Kratie',              530.00,  19, 530,  10, 1, NOW() - INTERVAL 30 DAY),
(21, 'Vathana Nam',       '012345021', 'vathana.n@email.com',   '#77, Street 98, Phnom Penh',          0.00,    0,  0,    10, 1, NOW()),
(22, 'Sophea Rang',       '012345022', 'sophea.r@email.com',    '#88, Street 11, Battambang',          0.00,    0,  0,    10, 1, NOW()),
(23, 'Davith Korn',       '012345023', 'davith.k@email.com',    '#99, Street 22, Phnom Penh',          1670.00, 48, 1670, 10, 1, NOW() - INTERVAL 80 DAY),
(24, 'Sokha Liv',         '012345024', 'sokha.l@email.com',     '#100, Street 33, Kampong Thom',       2450.75, 70, 2400, 10, 1, NOW() - INTERVAL 75 DAY),
(25, 'Sambath Un',        '012345025', 'sambath.u@email.com',   '#111, Street 44, Phnom Penh',         890.00,  30, 890,  10, 1, NOW() - INTERVAL 65 DAY),
(26, 'Rasmey Mak',        '012345026', 'rasmey.m@email.com',    '#122, Street 55, Siem Reap',          3120.50, 85, 3100, 10, 1, NOW() - INTERVAL 60 DAY),
(27, 'Sophat Phal',       '012345027', 'sophat.p@email.com',    '#133, Street 66, Phnom Penh',         670.00,  20, 670,  10, 1, NOW() - INTERVAL 55 DAY),
(28, 'Virak Chum',        '012345028', 'virak.c@email.com',     '#144, Street 77, Kampot',             1890.25, 55, 1890, 10, 1, NOW() - INTERVAL 50 DAY),
(29, 'Chanthea Mam',      '012345029', 'chanthea.m@email.com',  '#155, Street 88, Phnom Penh',         4300.00, 110, 4200, 10, 1, NOW() - INTERVAL 45 DAY),
(30, 'Sary Peou',         '012345030', 'sary.p@email.com',      '#166, Street 99, Takeo',              350.00,  12, 350,  10, 1, NOW() - INTERVAL 40 DAY),
(31, 'Ratanak Soeung',    '012345031', 'ratanak.s@email.com',   '#177, Street 111, Phnom Penh',        2780.00, 75, 2780, 10, 1, NOW() - INTERVAL 35 DAY),
(32, 'Sreynich Kuy',      '012345032', 'sreynich.k@email.com',  '#188, Street 222, Pursat',            560.50,  18, 560,  10, 1, NOW() - INTERVAL 30 DAY),
(33, 'Bunthoeun Yim',     '012345033', 'bunthoeun.y@email.com', '#199, Street 333, Phnom Penh',        4100.25, 105, 4000, 10, 1, NOW() - INTERVAL 25 DAY),
(34, 'Chanthou Nhek',     '012345034', 'chanthou.n@email.com',  '#200, Street 444, Kampong Cham',      720.00,  24, 720,  10, 1, NOW() - INTERVAL 20 DAY),
(35, 'Sokny Srey',        '012345035', 'sokny.s@email.com',     '#211, Street 555, Phnom Penh',        5600.00, 145, 5500, 10, 1, NOW() - INTERVAL 15 DAY),
(36, 'Kosal Sean',        '012345036', 'kosal.s@email.com',     '#222, Street 666, Battambang',        0.00,    0,  0,    10, 1, NOW()),
(37, 'Sotheary Lim',      '012345037', 'sotheary.l@email.com',  '#233, Street 777, Phnom Penh',        980.00,  32, 980,  10, 1, NOW() - INTERVAL 80 DAY),
(38, 'Phirun Khiev',      '012345038', 'phirun.k@email.com',    '#244, Street 888, Siem Reap',         2150.50, 65, 2150, 10, 1, NOW() - INTERVAL 70 DAY),
(39, 'Sreymao Khorn',     '012345039', 'sreymao.k@email.com',   '#255, Street 999, Phnom Penh',        1430.00, 40, 1430, 10, 1, NOW() - INTERVAL 60 DAY),
(40, 'Narith Prom',       '012345040', 'narith.p@email.com',    '#266, Street 101, Kampot',            340.00,  10, 340,  10, 1, NOW() - INTERVAL 50 DAY),
(41, 'Seyha Song',        '012345041', 'seyha.s@email.com',     '#277, Street 202, Phnom Penh',        2890.75, 82, 2800, 10, 1, NOW() - INTERVAL 40 DAY),
(42, 'Sakun Vong',        '012345042', 'sakun.v@email.com',     '#288, Street 303, Sihanoukville',     610.00,  20, 610,  10, 1, NOW() - INTERVAL 30 DAY),
(43, 'Sopheap Dy',        '012345043', 'sopheap.d@email.com',   '#299, Street 404, Phnom Penh',        3700.00, 98, 3700, 10, 1, NOW() - INTERVAL 20 DAY),
(44, 'Visal Tola',        '012345044', 'visal.t@email.com',     '#300, Street 505, Kampong Thom',      0.00,    0,  0,    10, 1, NOW()),
(45, 'Sreylak Nop',       '012345045', 'sreylak.n@email.com',   '#311, Street 606, Phnom Penh',        1560.00, 45, 1560, 10, 1, NOW() - INTERVAL 80 DAY),
(46, 'Rady Roeun',        '012345046', 'rady.r@email.com',      '#322, Street 707, Battambang',        2200.50, 60, 2200, 10, 1, NOW() - INTERVAL 70 DAY),
(47, 'Channak Pin',       '012345047', 'channak.p@email.com',   '#333, Street 808, Phnom Penh',        800.25,  26, 800,  10, 1, NOW() - INTERVAL 55 DAY),
(48, 'Sovann Rot',        '012345048', 'sovann.r@email.com',    '#344, Street 909, Takeo',             4900.00, 125, 4800, 10, 1, NOW() - INTERVAL 45 DAY),
(49, 'Nita Prak',         '012345049', 'nita.p@email.com',      '#355, Street 111, Phnom Penh',        0.00,    0,  0,    10, 1, NOW()),
(50, 'Heng Lim',          '012345050', 'heng.l@email.com',      '#366, Street 222, Kampong Speu',      1830.50, 50, 1830, 10, 1, NOW() - INTERVAL 60 DAY)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ═══════════════════════════════════════════════════════════════════════════════
--  4. SUPPLIERS  (10 suppliers)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT IGNORE INTO suppliers (id, name, contact_person, phone, email, address, tax_id, is_active, notes, created_at) VALUES
(1,  'Angkor Beverage Distributor',   'Sok Sambo',      '023880001', 'sambo.s@angkor-bev.com',     '#1, Street 2004, Phnom Penh',        'KH-100001', 1, 'Main beverage supplier',               NOW() - INTERVAL 90 DAY),
(2,  'Mekong Snacks Co.',             'Srey Rath',      '023880002', 'rath.s@mekong-snacks.com',    '#10, Street 271, Phnom Penh',        'KH-100002', 1, 'Snacks and confectionery',              NOW() - INTERVAL 85 DAY),
(3,  'Milk River Dairy Ltd.',         'Savuth Kao',     '023880003', 'savuth.k@milk-river.com',     '#20, Street 105, Phnom Penh',        'KH-100003', 1, 'Dairy products and cheeses',            NOW() - INTERVAL 80 DAY),
(4,  'Golden Bakery Supply',          'Chanthou Mom',   '023880004', 'chanthou.m@golden-bake.com',  '#30, Street 450, Phnom Penh',        'KH-100004', 1, 'Bread and pastry ingredients',          NOW() - INTERVAL 75 DAY),
(5,  'Cold Storage Import/Export',    'Hak Leng',       '023880005', 'hak.l@cold-storage.com',      '#40, Street 598, Phnom Penh',        'KH-100005', 1, 'Frozen goods and ice cream',            NOW() - INTERVAL 70 DAY),
(6,  'CleanHome Trading',             'Boramey Sok',    '023880006', 'boramey.s@cleanhome.com',     '#50, Street 330, Phnom Penh',        'KH-100006', 1, 'Household cleaning products',           NOW() - INTERVAL 65 DAY),
(7,  'Phnom Penh Personal Care',      'Sophea Neak',    '023880007', 'sophea.n@pp-care.com',        '#60, Street 128, Phnom Penh',        'KH-100007', 1, 'Personal care and beauty products',     NOW() - INTERVAL 60 DAY),
(8,  'FreshFarm Produce',             'Rithya Chan',    '023880008', 'rithya.c@freshfarm.com',      '#70, Street 372, Kampong Cham',      'KH-100008', 1, 'Fresh fruits and vegetables',           NOW() - INTERVAL 55 DAY),
(9,  'QuickMeal Import Corp.',        'Meng Hong',      '023880009', 'meng.h@quickmeal.com',        '#80, Street 512, Phnom Penh',        'KH-100009', 1, 'Instant foods, noodles, canned goods',  NOW() - INTERVAL 50 DAY),
(10, 'Mighty Distributors KH',        'Sivorn Yin',     '023880010', 'sivorn.y@mightydist.com',     '#90, Street 199, Phnom Penh',        'KH-100010', 1, 'General wholesale - all categories',    NOW() - INTERVAL 45 DAY)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ═══════════════════════════════════════════════════════════════════════════════
--  5. PRODUCTS  (100 products across 10 categories)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT IGNORE INTO products (id, name, name_kh, barcode, price, cost_price, stock, low_stock_threshold, expiry_date, category_id, description, is_active, created_at) VALUES
-- Beverages (1-12)
(1,   'Coca-Cola 355ml',         'កូកាកូឡា 355ml',          '885100100001', 1.50,  0.80,  150, 20, NULL,                 1, 'Carbonated cola drink', 1, NOW() - INTERVAL 90 DAY),
(2,   'Pepsi 355ml',             'ប៉ិបស៊ី 355ml',            '885100100002', 1.50,  0.80,  120, 20, NULL,                 1, 'Carbonated cola drink', 1, NOW() - INTERVAL 90 DAY),
(3,   'Sprite 355ml',            'ស្ព្រាយ 355ml',             '885100100003', 1.50,  0.78,  80,  20, NULL,                 1, 'Lemon-lime soda',       1, NOW() - INTERVAL 90 DAY),
(4,   'Coca-Cola 1.5L',          'កូកាកូឡា 1.5L',            '885100100004', 2.50,  1.30,  60,  15, NULL,                 1, 'Family size cola',      1, NOW() - INTERVAL 85 DAY),
(5,   'Pepsi 1.5L',              'ប៉ិបស៊ី 1.5L',              '885100100005', 2.50,  1.30,  0,   15,  NULL,                 1, 'Family size pepsi (out of stock)', 1, NOW() - INTERVAL 85 DAY),
(6,   'Bottled Water 500ml',     'ទឹកបរិសុទ្ធ 500ml',        '885100100006', 0.60,  0.25,  300, 50, NULL,                 1, 'Natural spring water',  1, NOW() - INTERVAL 90 DAY),
(7,   'Bottled Water 1.5L',      'ទឹកបរិសុទ្ធ 1.5L',         '885100100007', 1.00,  0.40,  200, 30, NULL,                 1, 'Large spring water',    1, NOW() - INTERVAL 90 DAY),
(8,   'Orange Juice 250ml',      'ទឹកក្រូច 250ml',           '885100100008', 2.00,  1.10,  35,  15, DATE_ADD(NOW(), INTERVAL 7 DAY),  1, 'Fresh squeezed OJ',     1, NOW() - INTERVAL 60 DAY),
(9,   'Sting Energy 330ml',      'ស្ទីង 330ml',               '885100100009', 1.75,  0.90,  90,  20, NULL,                 1, 'Energy drink',          1, NOW() - INTERVAL 80 DAY),
(10,  'Iced Tea Lemon 330ml',    'តែទឹកកកក្រូច 330ml',       '885100100010', 1.50,  0.70,  45,  15, NULL,                 1, 'Lemon iced tea',        1, NOW() - INTERVAL 70 DAY),
(11,  'Soy Milk 250ml',          'ទឹកសណ្តែក 250ml',          '885100100011', 1.25,  0.60,  25,  10, DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 'Sweet soy milk',        1, NOW() - INTERVAL 50 DAY),
(12,  'Coffee Latte 240ml',      'កាហ្វេឡាតេ 240ml',          '885100100012', 2.25,  1.20,  40,  15, NULL,                 1, 'Ready-to-drink latte',  1, NOW() - INTERVAL 45 DAY),
-- Snacks (13-24)
(13,  'Potato Chips Original 80g','បន្ទះស្រូវ 80g',          '885200200001', 1.25,  0.65,  80,  20, NULL,                 2, 'Classic salted chips',  1, NOW() - INTERVAL 90 DAY),
(14,  'Potato Chips BBQ 80g',    'បន្ទះស្រូវ BBQ 80g',       '885200200002', 1.25,  0.65,  60,  20, NULL,                 2, 'BBQ flavored chips',    1, NOW() - INTERVAL 85 DAY),
(15,  'Chocolate Bar 100g',      'សូកូឡា 100g',              '885200200003', 2.00,  1.10,  5,   10,  DATE_ADD(NOW(), INTERVAL 60 DAY), 2, 'Milk chocolate (low stock)', 1, NOW() - INTERVAL 80 DAY),
(16,  'Mixed Nuts 150g',         'គ្រាប់ធញ្ញជាតិ 150g',     '885200200004', 3.00,  1.80,  20,  10, DATE_ADD(NOW(), INTERVAL 120 DAY), 2, 'Roasted mixed nuts',    1, NOW() - INTERVAL 75 DAY),
(17,  'Butter Cookies 120g',     'ខូគីប៊ឺ 120g',             '885200200005', 1.50,  0.80,  55,  15, NULL,                 2, 'Butter cookies',        1, NOW() - INTERVAL 70 DAY),
(18,  'Candy Pack Assorted 200g','ស្ករគ្រាប់ 200g',           '885200200006', 0.75,  0.35,  100, 20, NULL,                 2, 'Assorted fruit candies', 1, NOW() - INTERVAL 65 DAY),
(19,  'Pocky Chocolate 40g',     'ផុកគី 40g',                 '885200200007', 1.10,  0.55,  70,  20, NULL,                 2, 'Chocolate biscuit sticks', 1, NOW() - INTERVAL 60 DAY),
(20,  'Rice Crackers 100g',      'នំកែករស្រូវ 100g',        '885200200008', 1.80,  1.00,  30,  15, NULL,                 2, 'Japanese rice crackers', 1, NOW() - INTERVAL 55 DAY),
(21,  'Coconut Cookies 150g',    'នំដូង 150g',               '885200200009', 2.20,  1.30,  0,   10,  NULL,                 2, 'Coconut cookies (out of stock)', 1, NOW() - INTERVAL 50 DAY),
(22,  'Cashew Nuts 100g',        'ស្វាយចន្ទី 100g',          '885200200010', 3.50,  2.20,  15,  10, DATE_ADD(NOW(), INTERVAL 180 DAY), 2, 'Roasted cashew nuts',   1, NOW() - INTERVAL 45 DAY),
(23,  'Cheese Crackers 80g',     'នំកែកឈីស 80g',            '885200200011', 1.35,  0.70,  40,  15, NULL,                 2, 'Cheese flavored crackers', 1, NOW() - INTERVAL 40 DAY),
(24,  'Chocolate Wafer 50g',     'វ៉េហ្វឺសូកូឡា 50g',      '885200200012', 0.95,  0.45,  65,  20, NULL,                 2, 'Crispy chocolate wafer', 1, NOW() - INTERVAL 35 DAY),
-- Dairy (25-34)
(25,  'Fresh Milk 1L',           'ទឹកដោះគោស្រស់ 1L',        '885300300001', 2.50,  1.60,  8,   15,  DATE_ADD(NOW(), INTERVAL 5 DAY),  3, 'Pasteurized fresh milk (near expiry)', 1, NOW() - INTERVAL 80 DAY),
(26,  'Yogurt Strawberry 180ml', 'ទឹកដោះគោជូរស្ត្របឺរី',     '885300300002', 1.50,  0.90,  50,  15, DATE_ADD(NOW(), INTERVAL 14 DAY), 3, 'Strawberry yogurt',     1, NOW() - INTERVAL 75 DAY),
(27,  'Cheddar Cheese 200g',     'ឈីសឆេដារ 200g',            '885300300003', 4.00,  2.60,  4,   10,  DATE_ADD(NOW(), INTERVAL 45 DAY), 3, 'Cheddar block cheese (low stock)', 1, NOW() - INTERVAL 70 DAY),
(28,  'Butter Unsalted 250g',    'ប៊ឺគ្មានអំបិល 250g',        '885300300004', 2.25,  1.40,  30,  10, DATE_ADD(NOW(), INTERVAL 60 DAY), 3, 'Unsalted butter',       1, NOW() - INTERVAL 65 DAY),
(29,  'Ice Cream Vanilla 500ml', 'ការ៉េមវ៉ានីឡា 500ml',      '885300300005', 3.00,  1.80,  7,   10,  DATE_ADD(NOW(), INTERVAL 90 DAY), 3, 'Vanilla ice cream (low stock)', 1, NOW() - INTERVAL 60 DAY),
(30,  'Cream Cheese 150g',       'ឈីសក្រែម 150g',            '885300300006', 3.50,  2.30,  20,  10, DATE_ADD(NOW(), INTERVAL 50 DAY), 3, 'Spreadable cream cheese', 1, NOW() - INTERVAL 55 DAY),
(31,  'Chocolate Milk 250ml',    'ទឹកដោះគោសូកូឡា 250ml',    '885300300007', 1.75,  1.00,  35,  15, DATE_ADD(NOW(), INTERVAL 10 DAY), 3, 'Chocolate milk (near expiry)', 1, NOW() - INTERVAL 50 DAY),
(32,  'Plain Yogurt 500ml',      'ទឹកដោះគោជូរធម្មតា 500ml', '885300300008', 2.80,  1.70,  12,  10, DATE_ADD(NOW(), INTERVAL 20 DAY), 3, 'Plain unsweetened yogurt', 1, NOW() - INTERVAL 45 DAY),
(33,  'Sour Cream 200ml',        'ក្រែមជូរ 200ml',           '885300300009', 2.00,  1.20,  3,   10,  DATE_ADD(NOW(), INTERVAL 35 DAY), 3, 'Sour cream (low stock)', 1, NOW() - INTERVAL 40 DAY),
(34,  'Evaporated Milk 385ml',   'ទឹកដោះគោខាប់ 385ml',      '885300300010', 1.80,  1.05,  90,  20, DATE_ADD(NOW(), INTERVAL 365 DAY), 3, 'Canned evaporated milk', 1, NOW() - INTERVAL 35 DAY),
-- Bakery (35-42)
(35,  'Baguette Fresh',          'នំប៉័ងបារាំង',              '885400400001', 1.00,  0.45,  25,  10, NULL,                 4, 'Fresh French baguette', 1, NOW() - INTERVAL 80 DAY),
(36,  'Croissant Butter',        'ក្រូអាសង់',                 '885400400002', 1.50,  0.75,  15,  10, NULL,                 4, 'Butter croissant',      1, NOW() - INTERVAL 75 DAY),
(37,  'White Bread Loaf',        'នំប៉័ងស 1 ដុំ',              '885400400003', 1.75,  0.90,  30,  15, NULL,                 4, 'Sliced white bread',    1, NOW() - INTERVAL 70 DAY),
(38,  'Wheat Bread Loaf',        'នំប៉័ងស្រូវសាលី',           '885400400004', 2.00,  1.10,  20,  15, NULL,                 4, 'Healthy wheat bread',   1, NOW() - INTERVAL 65 DAY),
(39,  'Muffin Blueberry',        'ម៉ាហ្វាំងប៊្លូបឺរី',          '885400400005', 2.25,  1.30,  10,  10, NULL,                 4, 'Blueberry muffin',      1, NOW() - INTERVAL 60 DAY),
(40,  'Donut Glazed',            'ដូណាត់',                    '885400400006', 1.20,  0.55,  5,   15,  NULL,                 4, 'Glazed donut (low stock)', 1, NOW() - INTERVAL 55 DAY),
(41,  'Cheese Danish',           'ដានីសឈីស',                 '885400400007', 2.50,  1.50,  18,  10, NULL,                 4, 'Cheese danish pastry',  1, NOW() - INTERVAL 50 DAY),
(42,  'Chocolate Muffin',        'ម៉ាហ្វាំងសូកូឡា',           '885400400008', 2.25,  1.30,  22,  10, NULL,                 4, 'Double chocolate muffin', 1, NOW() - INTERVAL 45 DAY),
-- Frozen Foods (43-52)
(43,  'Vanilla Ice Cream 1L',    'ការ៉េមវ៉ានីឡា 1L',         '885500500001', 4.50,  2.80,  2,   10,  DATE_ADD(NOW(), INTERVAL 180 DAY), 5, 'Premium vanilla (low stock)', 1, NOW() - INTERVAL 80 DAY),
(44,  'Chocolate Ice Cream 1L',  'ការ៉េមសូកូឡា 1L',          '885500500002', 4.50,  2.80,  0,   10,  DATE_ADD(NOW(), INTERVAL 180 DAY), 5, 'Chocolate (out of stock)', 1, NOW() - INTERVAL 75 DAY),
(45,  'Frozen Mixed Veg 500g',   'បន្លែកកចម្រុះ 500g',        '885500500003', 2.50,  1.50,  35,  15, DATE_ADD(NOW(), INTERVAL 270 DAY), 5, 'Carrots, peas, corn',   1, NOW() - INTERVAL 70 DAY),
(46,  'Frozen French Fries 1kg', 'ហ្វ្រេនហ្វ្រាយ 1kg',         '885500500004', 3.00,  1.80,  40,  15, DATE_ADD(NOW(), INTERVAL 365 DAY), 5, 'French fries',          1, NOW() - INTERVAL 65 DAY),
(47,  'Frozen Pizza 300g',       'ភីហ្សាកក 300g',              '885500500005', 5.00,  3.20,  15,  10, DATE_ADD(NOW(), INTERVAL 200 DAY), 5, 'Margherita pizza',      1, NOW() - INTERVAL 60 DAY),
(48,  'Ice Cream Sandwich',      'សាំងវិចការ៉េម',             '885500500006', 1.50,  0.80,  60,  20, DATE_ADD(NOW(), INTERVAL 120 DAY), 5, 'Vanilla ice cream sandwich', 1, NOW() - INTERVAL 55 DAY),
(49,  'Frozen Dumplings 400g',   'គីវកក 400g',                '885500500007', 3.75,  2.30,  25,  10, DATE_ADD(NOW(), INTERVAL 240 DAY), 5, 'Pork & vegetable dumplings', 1, NOW() - INTERVAL 50 DAY),
(50,  'Frozen Spring Rolls 300g','ចៀនកក 300g',                '885500500008', 2.80,  1.60,  0,   10,  DATE_ADD(NOW(), INTERVAL 210 DAY), 5, 'Spring rolls (out of stock)', 1, NOW() - INTERVAL 45 DAY),
(51,  'Frozen Fish Fillet 400g', 'ត្រីកក 400g',                '885500500009', 4.00,  2.60,  18,  10, DATE_ADD(NOW(), INTERVAL 150 DAY), 5, 'Fish fillet',           1, NOW() - INTERVAL 40 DAY),
(52,  'Frozen Chicken Nuggets 500g','មាន់កក 500g',             '885500500010', 3.50,  2.20,  30,  15, DATE_ADD(NOW(), INTERVAL 300 DAY), 5, 'Chicken nuggets',       1, NOW() - INTERVAL 35 DAY),
-- Household (53-62)
(53,  'Dish Soap 500ml',         'សាប៊ូលាងចាន 500ml',         '885600600001', 2.50,  1.30,  45,  15, NULL,                 6, 'Lemon dish soap',       1, NOW() - INTERVAL 80 DAY),
(54,  'Laundry Detergent 1kg',   'ម្សៅបោកគក់ 1kg',            '885600600002', 4.00,  2.50,  30,  15, NULL,                 6, 'Powder detergent',      1, NOW() - INTERVAL 75 DAY),
(55,  'All-Purpose Cleaner 750ml','ទឹកសម្អាត 750ml',          '885600600003', 3.00,  1.70,  20,  15, NULL,                 6, 'Multi-surface cleaner', 1, NOW() - INTERVAL 70 DAY),
(56,  'Trash Bags 30pcs',        'ថង់សំរាម 30',               '885600600004', 2.00,  1.00,  55,  20, NULL,                 6, 'Large garbage bags',    1, NOW() - INTERVAL 65 DAY),
(57,  'Paper Towels 6 Rolls',    'ក្រដាស់ជូត 6 វិល',           '885600600005', 3.50,  2.10,  25,  15, NULL,                 6, 'Kitchen paper towels',  1, NOW() - INTERVAL 60 DAY),
(58,  'Sponge Pack 5pcs',        'អេប៉ុង 5',                   '885600600006', 1.50,  0.75,  80,  20, NULL,                 6, 'Kitchen sponges',       1, NOW() - INTERVAL 55 DAY),
(59,  'Glass Cleaner 500ml',     'ទឹកសម្អាតកញ្ចក់ 500ml',     '885600600007', 2.75,  1.50,  22,  15, NULL,                 6, 'Streak-free glass cleaner', 1, NOW() - INTERVAL 50 DAY),
(60,  'Toilet Cleaner 500ml',    'ទឹកសម្អាតបង្គន់ 500ml',      '885600600008', 2.25,  1.20,  35,  15, NULL,                 6, 'Toilet bowl cleaner',   1, NOW() - INTERVAL 45 DAY),
(61,  'Tissue Paper 10 Packs',   'ក្រដាស់អនាម័យ 10កញ្ចប់',     '885600600009', 4.50,  2.80,  8,   10,  NULL,                 6, 'Facial tissue (low stock)', 1, NOW() - INTERVAL 40 DAY),
(62,  'Floor Cleaner 1L',        'ទឹកសម្អាតកម្រាល 1L',         '885600600010', 3.25,  1.90,  40,  15, NULL,                 6, 'Floor cleaning liquid',  1, NOW() - INTERVAL 35 DAY),
-- Personal Care (63-74)
(63,  'Shampoo 200ml',           'សាប៊ូកក់សក់ 200ml',         '885700700001', 3.50,  2.00,  30,  15, NULL,                 7, 'Hair shampoo',          1, NOW() - INTERVAL 80 DAY),
(64,  'Toothpaste 100g',         'ថ្នាំដុសធ្មេញ 100g',         '885700700002', 2.00,  1.00,  60,  20, NULL,                 7, 'Mint toothpaste',       1, NOW() - INTERVAL 75 DAY),
(65,  'Body Soap 100g',          'សាប៊ូដុំ 100g',              '885700700003', 1.25,  0.55,  90,  20, NULL,                 7, 'Moisturizing soap',     1, NOW() - INTERVAL 70 DAY),
(66,  'Deodorant 50ml',          'ឌីអូដូរ៉ង់ 50ml',           '885700700004', 2.75,  1.60,  25,  15, NULL,                 7, 'Sport deodorant',       1, NOW() - INTERVAL 65 DAY),
(67,  'Hand Sanitizer 100ml',    'សានីតាយសឺរ 100ml',          '885700700005', 1.80,  0.90,  45,  15, NULL,                 7, 'Alcohol sanitizer',     1, NOW() - INTERVAL 60 DAY),
(68,  'Facial Cleanser 100ml',   'ទឹកសម្អាតមុខ 100ml',         '885700700006', 3.00,  1.80,  20,  15, NULL,                 7, 'Gentle facial wash',    1, NOW() - INTERVAL 55 DAY),
(69,  'Conditioner 200ml',       'បន្ទន់សក់ 200ml',            '885700700007', 3.50,  2.00,  18,  15, NULL,                 7, 'Hair conditioner',      1, NOW() - INTERVAL 50 DAY),
(70,  'Toothbrush Soft',         'ច្រាសដុសធ្មេញ',             '885700700008', 1.50,  0.70,  40,  20, NULL,                 7, 'Soft bristle brush',    1, NOW() - INTERVAL 45 DAY),
(71,  'Body Lotion 250ml',       'ឡេលាបខ្លួន 250ml',           '885700700009', 4.00,  2.50,  12,  10, NULL,                 7, 'Moisturizing lotion',   1, NOW() - INTERVAL 40 DAY),
(72,  'Shaving Cream 100ml',     'ក្រែមកោរសក់ 100ml',         '885700700010', 2.50,  1.40,  10,  10, NULL,                 7, 'Shaving foam (low stock)', 1, NOW() - INTERVAL 35 DAY),
(73,  'Sunscreen SPF50 50ml',    'ឡេការពារកម្តៅថ្ងៃ SPF50',    '885700700011', 5.00,  3.20,  0,   10,  DATE_ADD(NOW(), INTERVAL 365 DAY), 7, 'Sunscreen (out of stock)', 1, NOW() - INTERVAL 30 DAY),
(74,  'Wet Wipes 50 Sheets',     'ក្រដាស់សើម 50',              '885700700012', 1.75,  0.85,  70,  20, NULL,                 7, 'Baby wet wipes',        1, NOW() - INTERVAL 25 DAY),
-- Fruits (75-84)
(75,  'Apple Red 1kg',           'ផ្លែប៉ោម 1kg',               '885800800001', 3.50,  2.20,  30,  10, NULL,                 8, 'Red apples per kg',     1, NOW() - INTERVAL 70 DAY),
(76,  'Banana 1 Bunch',          'ចេក 1 ស្និទ្ធ',                '885800800002', 1.50,  0.80,  50,  15, NULL,                 8, 'Fresh bananas',         1, NOW() - INTERVAL 65 DAY),
(77,  'Orange 1kg',              'ក្រូច 1kg',                   '885800800003', 2.50,  1.50,  25,  10, NULL,                 8, 'Juicy oranges per kg',  1, NOW() - INTERVAL 60 DAY),
(78,  'Grapes Green 500g',       'ទំពាំងបាយជូរ 500g',          '885800800004', 3.00,  1.90,  20,  10, NULL,                 8, 'Green seedless grapes', 1, NOW() - INTERVAL 55 DAY),
(79,  'Mango Ripe 1kg',          'ស្វាយទុំ 1kg',               '885800800005', 2.00,  1.20,  35,  15, NULL,                 8, 'Sweet ripe mangoes',    1, NOW() - INTERVAL 50 DAY),
(80,  'Watermelon Whole',        'ឪឡឹក 1 ផ្លែ',                  '885800800006', 3.00,  1.70,  10,  10, NULL,                 8, 'Whole watermelon',      1, NOW() - INTERVAL 45 DAY),
(81,  'Pineapple Whole',         'ម្នាស់ 1 ផ្លែ',                 '885800800007', 2.50,  1.40,  15,  10, NULL,                 8, 'Fresh pineapple',       1, NOW() - INTERVAL 40 DAY),
(82,  'Dragon Fruit Red 1kg',    'ផ្លែដ្រាហ្គោន 1kg',            '885800800008', 4.00,  2.60,  12,  10, NULL,                 8, 'Red dragon fruit',      1, NOW() - INTERVAL 35 DAY),
(83,  'Avocado 1kg',             'ផ្លែបឺរ 1kg',                 '885800800009', 5.00,  3.30,  8,   10,  NULL,                 8, 'Ripe avocado (low stock)', 1, NOW() - INTERVAL 30 DAY),
(84,  'Lime 500g',               'ក្រូចឆ្មារ 500g',              '885800800010', 1.75,  0.90,  40,  15, NULL,                 8, 'Fresh limes',           1, NOW() - INTERVAL 25 DAY),
-- Vegetables (85-92)
(85,  'Cabbage Whole',           'ស្ពៃ 1 ដើម',                   '885900900001', 1.50,  0.75,  25,  10, NULL,                 9, 'Green cabbage',         1, NOW() - INTERVAL 65 DAY),
(86,  'Carrots 1kg',             'ការ៉ុត 1kg',                  '885900900002', 2.00,  1.10,  30,  15, NULL,                 9, 'Fresh carrots',         1, NOW() - INTERVAL 60 DAY),
(87,  'Cucumber 1kg',            'ត្រសក់ 1kg',                  '885900900003', 1.50,  0.75,  20,  15, NULL,                 9, 'Fresh cucumbers',       1, NOW() - INTERVAL 55 DAY),
(88,  'Tomato 1kg',              'ប៉េងប៉ោះ 1kg',               '885900900004', 2.50,  1.40,  15,  10, NULL,                 9, 'Ripe tomatoes',         1, NOW() - INTERVAL 50 DAY),
(89,  'Lettuce Iceberg',         'សាឡាត់ 1 ដើម',               '885900900005', 1.75,  0.90,  18,  10, NULL,                 9, 'Iceberg lettuce',       1, NOW() - INTERVAL 45 DAY),
(90,  'Broccoli 500g',           'ប្រូខូលី 500g',              '885900900006', 2.25,  1.30,  10,  10, NULL,                 9, 'Fresh broccoli (low stock)', 1, NOW() - INTERVAL 40 DAY),
(91,  'Potato 1kg',              'ដំឡូង 1kg',                  '885900900007', 2.00,  1.10,  45,  15, NULL,                 9, 'White potatoes',        1, NOW() - INTERVAL 35 DAY),
(92,  'Onion 1kg',               'ខ្ទឹមបារាំង 1kg',             '885900900008', 1.75,  0.90,  50,  15, NULL,                 9, 'Yellow onions',         1, NOW() - INTERVAL 30 DAY),
-- Instant Foods (93-100)
(93,  'Instant Noodles Beef 75g','មីសាច់គោ 75g',              '885000900001', 0.75,  0.35,  200, 50, NULL,                 10, 'Beef flavor noodles',   1, NOW() - INTERVAL 85 DAY),
(94,  'Instant Noodles Chicken 75g','មីសាច់មាន់ 75g',          '885000900002', 0.75,  0.35,  180, 50, NULL,                 10, 'Chicken flavor noodles', 1, NOW() - INTERVAL 80 DAY),
(95,  'Canned Tuna 150g',        'ត្រីខកំប៉ុង 150g',            '885000900003', 2.00,  1.20,  60,  20, DATE_ADD(NOW(), INTERVAL 365 DAY), 10, 'Tuna in brine',          1, NOW() - INTERVAL 75 DAY),
(96,  'Canned Sardines 155g',    'ត្រីសាឌីន 155g',             '885000900004', 1.50,  0.85,  45,  20, DATE_ADD(NOW(), INTERVAL 300 DAY), 10, 'Sardines in tomato sauce', 1, NOW() - INTERVAL 70 DAY),
(97,  'Soy Sauce 500ml',         'ទឹកស៊ីអ៊ីវ 500ml',            '885000900005', 1.75,  0.90,  35,  15, NULL,                 10, 'Premium soy sauce',      1, NOW() - INTERVAL 65 DAY),
(98,  'Fish Sauce 500ml',        'ទឹកត្រី 500ml',               '885000900006', 2.00,  1.10,  40,  15, NULL,                 10, 'Premium fish sauce',     1, NOW() - INTERVAL 60 DAY),
(99,  'Cooking Oil 1L',          'ប្រេងឆា 1L',                  '885000900007', 3.00,  1.80,  25,  15, NULL,                 10, 'Vegetable cooking oil',   1, NOW() - INTERVAL 55 DAY),
(100, 'Tomato Ketchup 500ml',    'ទឹកប៉េងប៉ោះ 500ml',          '885000900008', 2.50,  1.40,  30,  15, NULL,                 10, 'Tomato ketchup',         1, NOW() - INTERVAL 50 DAY)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ═══════════════════════════════════════════════════════════════════════════════
--  6. QUICK PICKS  (10 popular items)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT IGNORE INTO quick_picks (id, label, label_kh, price, icon, sort_order, is_active, created_at) VALUES
(1,  'Coca-Cola 355ml',    'កូកាកូឡា',    1.50,  '🥤', 1, 1, NOW() - INTERVAL 90 DAY),
(2,  'Bottled Water',      'ទឹកបរិសុទ្ធ',    0.60,  '💧', 2, 1, NOW() - INTERVAL 90 DAY),
(3,  'Instant Noodles',    'មី',          0.75,  '🍜', 3, 1, NOW() - INTERVAL 90 DAY),
(4,  'Fresh Milk 1L',      'ទឹកដោះគោ',    2.50,  '🥛', 4, 1, NOW() - INTERVAL 90 DAY),
(5,  'White Bread',        'នំប៉័ង',       1.75,  '🍞', 5, 1, NOW() - INTERVAL 90 DAY),
(6,  'Rice 1kg',           'បាយ 1kg',     3.00,  '🍚', 6, 1, NOW() - INTERVAL 90 DAY),
(7,  'Eggs 10pcs',         'ស៊ុត 10',     2.00,  '🥚', 7, 1, NOW() - INTERVAL 90 DAY),
(8,  'Coffee Latte',       'កាហ្វេ',        2.25,  '☕', 8, 1, NOW() - INTERVAL 90 DAY),
(9,  'Potato Chips',       'បន្ទះស្រូវ',    1.25,  '🍟', 9, 1, NOW() - INTERVAL 90 DAY),
(10, 'Sugar 1kg',          'ស្ករ 1kg',     2.50,  '🍬', 10, 1, NOW() - INTERVAL 90 DAY)
ON DUPLICATE KEY UPDATE label = VALUES(label);

-- ═══════════════════════════════════════════════════════════════════════════════
--  7. PURCHASE ORDERS  (30 POs)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT IGNORE INTO purchase_orders (id, order_number, supplier_id, status, subtotal, discount, shipping_cost, total, notes, ordered_by, received_by, received_at, created_at, updated_at) VALUES
(1,  'PO-2026-001', 1,  'received',              120.00, 5.00,  8.00,  123.00, 'Monthly beverage restock',       1, 2, NOW() - INTERVAL 85 DAY, NOW() - INTERVAL 88 DAY, NOW() - INTERVAL 85 DAY),
(2,  'PO-2026-002', 2,  'received',              85.50,  0.00,  5.00,  90.50,  'Snacks weekly delivery',         1, 2, NOW() - INTERVAL 82 DAY, NOW() - INTERVAL 84 DAY, NOW() - INTERVAL 82 DAY),
(3,  'PO-2026-003', 3,  'received',              210.00, 10.00, 12.00, 212.00, 'Dairy restock',                  1, 3, NOW() - INTERVAL 78 DAY, NOW() - INTERVAL 80 DAY, NOW() - INTERVAL 78 DAY),
(4,  'PO-2026-004', 4,  'received',              95.00,  0.00,  6.00,  101.00, 'Bakery ingredients',             1, 2, NOW() - INTERVAL 75 DAY, NOW() - INTERVAL 77 DAY, NOW() - INTERVAL 75 DAY),
(5,  'PO-2026-005', 5,  'received',              350.00, 15.00, 20.00, 355.00, 'Frozen goods bulk order',        1, 3, NOW() - INTERVAL 72 DAY, NOW() - INTERVAL 74 DAY, NOW() - INTERVAL 72 DAY),
(6,  'PO-2026-006', 6,  'received',              130.00, 5.00,  8.00,  133.00, 'Household supplies',             1, 2, NOW() - INTERVAL 68 DAY, NOW() - INTERVAL 70 DAY, NOW() - INTERVAL 68 DAY),
(7,  'PO-2026-007', 7,  'received',              175.00, 8.00,  10.00, 177.00, 'Personal care restock',          1, 3, NOW() - INTERVAL 65 DAY, NOW() - INTERVAL 67 DAY, NOW() - INTERVAL 65 DAY),
(8,  'PO-2026-008', 8,  'received',              140.00, 0.00,  15.00, 155.00, 'Fresh produce order',            1, 2, NOW() - INTERVAL 62 DAY, NOW() - INTERVAL 64 DAY, NOW() - INTERVAL 62 DAY),
(9,  'PO-2026-009', 9,  'received',              200.00, 10.00, 12.00, 202.00, 'Instant foods restock',          1, 3, NOW() - INTERVAL 58 DAY, NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 58 DAY),
(10, 'PO-2026-010', 10, 'received',              165.00, 5.00,  8.00,  168.00, 'General wholesale restock',      1, 2, NOW() - INTERVAL 55 DAY, NOW() - INTERVAL 57 DAY, NOW() - INTERVAL 55 DAY),
(11, 'PO-2026-011', 1,  'received',              95.00,  0.00,  6.00,  101.00, 'Beverages restock',              1, 3, NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 52 DAY, NOW() - INTERVAL 50 DAY),
(12, 'PO-2026-012', 3,  'received',              180.00, 8.00,  10.00, 182.00, 'Dairy emergency restock',        1, 2, NOW() - INTERVAL 48 DAY, NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 48 DAY),
(13, 'PO-2026-013', 5,  'received',              280.00, 12.00, 18.00, 286.00, 'Frozen foods restock',           1, 3, NOW() - INTERVAL 45 DAY, NOW() - INTERVAL 47 DAY, NOW() - INTERVAL 45 DAY),
(14, 'PO-2026-014', 2,  'received',              65.00,  0.00,  5.00,  70.00,  'Snacks restock',                1, 2, NOW() - INTERVAL 42 DAY, NOW() - INTERVAL 44 DAY, NOW() - INTERVAL 42 DAY),
(15, 'PO-2026-015', 7,  'received',              145.00, 5.00,  8.00,  148.00, 'Personal care restock',          1, 3, NOW() - INTERVAL 38 DAY, NOW() - INTERVAL 40 DAY, NOW() - INTERVAL 38 DAY),
(16, 'PO-2026-016', 9,  'ordered',               110.00, 0.00,  7.00,  117.00, 'Instant foods weekly',           1, NULL, NULL, NOW() - INTERVAL 35 DAY, NOW() - INTERVAL 35 DAY),
(17, 'PO-2026-017', 10, 'ordered',               200.00, 10.00, 12.00, 202.00, 'Wholesale general',              1, NULL, NULL, NOW() - INTERVAL 32 DAY, NOW() - INTERVAL 32 DAY),
(18, 'PO-2026-018', 4,  'draft',                 75.00,  0.00,  5.00,  80.00,  'Bakery order pending review',    1, NULL, NULL, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 30 DAY),
(19, 'PO-2026-019', 1,  'received',              130.00, 5.00,  8.00,  133.00, 'Beverages weekly',               1, 2, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 25 DAY),
(20, 'PO-2026-020', 6,  'ordered',               90.00,  0.00,  6.00,  96.00,  'Household restock',              1, NULL, NULL, NOW() - INTERVAL 22 DAY, NOW() - INTERVAL 22 DAY),
(21, 'PO-2026-021', 8,  'cancelled',             0.00,   0.00,  0.00,  0.00,   'Cancelled - supplier issue',     1, NULL, NULL, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 19 DAY),
(22, 'PO-2026-022', 5,  'received',              310.00, 15.00, 20.00, 315.00, 'Frozen foods bulk',              1, 3, NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 22 DAY, NOW() - INTERVAL 18 DAY),
(23, 'PO-2026-023', 2,  'partially_received',    55.00,  0.00,  5.00,  60.00,  'Snacks - partial delivery',      1, 2, NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 16 DAY),
(24, 'PO-2026-024', 3,  'ordered',               165.00, 5.00,  10.00, 170.00, 'Dairy order',                    1, NULL, NULL, NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY),
(25, 'PO-2026-025', 7,  'received',              120.00, 0.00,  8.00,  128.00, 'Personal care restock',          1, 2, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 10 DAY),
(26, 'PO-2026-026', 9,  'ordered',               85.00,  0.00,  5.00,  90.00,  'Noodles bulk order',             1, NULL, NULL, NOW() - INTERVAL 8 DAY,  NOW() - INTERVAL 8 DAY),
(27, 'PO-2026-027', 10, 'received',              250.00, 12.00, 15.00, 253.00, 'Monthly wholesale',              1, 3, NOW() - INTERVAL 5 DAY,  NOW() - INTERVAL 7 DAY,  NOW() - INTERVAL 5 DAY),
(28, 'PO-2026-028', 1,  'draft',                 75.00,  0.00,  5.00,  80.00,  'Beverage order draft',           1, NULL, NULL, NOW() - INTERVAL 3 DAY,  NOW() - INTERVAL 3 DAY),
(29, 'PO-2026-029', 6,  'ordered',               110.00, 5.00,  6.00,  111.00, 'Cleaning supplies',              1, NULL, NULL, NOW() - INTERVAL 1 DAY,  NOW() - INTERVAL 1 DAY),
(30, 'PO-2026-030', 4,  'draft',                 45.00,  0.00,  3.00,  48.00,  'Bakery trial order',             1, NULL, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE order_number = VALUES(order_number);

-- ═══════════════════════════════════════════════════════════════════════════════
--  8. PURCHASE ORDER ITEMS  (3-5 items per PO)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT IGNORE INTO purchase_order_items (id, purchase_order_id, product_id, quantity, received_quantity, unit_cost, total) VALUES
(1,  1,  1,  50, 50, 0.80,  40.00),   (2,  1,  2,  40, 40, 0.80,  32.00),   (3,  1,  3,  30, 30, 0.78,  23.40),   (4,  1,  6,  60, 60, 0.25,  15.00),
(5,  2,  13, 40, 40, 0.65,  26.00),   (6,  2,  14, 30, 30, 0.65,  19.50),   (7,  2,  17, 20, 20, 0.80,  16.00),   (8,  2,  18, 30, 30, 0.35,  10.50),
(9,  3,  25, 20, 20, 1.60,  32.00),   (10, 3,  26, 50, 50, 0.90,  45.00),   (11, 3,  27, 15, 15, 2.60,  39.00),   (12, 3,  28, 25, 25, 1.40,  35.00),
(13, 3,  34, 30, 30, 1.05,  31.50),   (14, 4,  35, 30, 30, 0.45,  13.50),   (15, 4,  36, 25, 25, 0.75,  18.75),   (16, 4,  37, 25, 25, 0.90,  22.50),
(17, 4,  38, 20, 20, 1.10,  22.00),   (18, 5,  43, 15, 15, 2.80,  42.00),   (19, 5,  45, 30, 30, 1.50,  45.00),   (20, 5,  46, 30, 30, 1.80,  54.00),
(21, 5,  47, 20, 20, 3.20,  64.00),   (22, 5,  48, 40, 40, 0.80,  32.00),   (23, 5,  52, 25, 25, 2.20,  55.00),   (24, 6,  53, 25, 25, 1.30,  32.50),
(25, 6,  54, 20, 20, 2.50,  50.00),   (26, 6,  55, 20, 20, 1.70,  34.00),   (27, 6,  58, 25, 25, 0.75,  18.75),   (28, 7,  63, 20, 20, 2.00,  40.00),
(29, 7,  64, 30, 30, 1.00,  30.00),   (30, 7,  65, 40, 40, 0.55,  22.00),   (31, 7,  66, 20, 20, 1.60,  32.00),   (32, 7,  67, 25, 25, 0.90,  22.50),
(33, 8,  75, 20, 20, 2.20,  44.00),   (34, 8,  76, 30, 30, 0.80,  24.00),   (35, 8,  77, 20, 20, 1.50,  30.00),   (36, 8,  79, 20, 20, 1.20,  24.00),
(37, 9,  93, 100, 100, 0.35, 35.00),  (38, 9,  94, 80, 80, 0.35, 28.00),    (39, 9,  95, 30, 30, 1.20, 36.00),   (40, 9,  96, 30, 30, 0.85, 25.50),
(41, 9,  97, 25, 25, 0.90, 22.50),    (42, 10, 6,  100, 100, 0.25, 25.00),  (43, 10, 99, 20, 20, 1.80, 36.00),   (44, 10, 100, 25, 25, 1.40, 35.00),
(45, 10, 56, 30, 30, 1.00, 30.00),    (46, 11, 1,  30, 30, 0.80, 24.00),    (47, 11, 2,  30, 30, 0.80, 24.00),   (48, 11, 4,  20, 20, 1.30, 26.00),
(49, 12, 25, 10, 10, 1.60, 16.00),    (50, 12, 29, 20, 20, 1.80, 36.00),    (51, 12, 30, 15, 15, 2.30, 34.50),   (52, 12, 32, 20, 20, 1.70, 34.00),
(53, 13, 43, 20, 20, 2.80, 56.00),    (54, 13, 45, 30, 30, 1.50, 45.00),    (55, 13, 48, 40, 40, 0.80, 32.00),   (56, 13, 51, 20, 20, 2.60, 52.00),
(57, 13, 52, 20, 20, 2.20, 44.00),    (58, 14, 13, 20, 20, 0.65, 13.00),    (59, 14, 15, 15, 15, 1.10, 16.50),   (60, 14, 19, 25, 25, 0.55, 13.75),
(61, 14, 24, 20, 20, 0.45, 9.00),     (62, 15, 63, 15, 15, 2.00, 30.00),    (63, 15, 64, 20, 20, 1.00, 20.00),   (64, 15, 68, 15, 15, 1.80, 27.00),
(65, 15, 70, 20, 20, 0.70, 14.00),    (66, 15, 71, 12, 12, 2.50, 30.00),    (67, 16, 93, 60, 0, 0.35, 21.00),    (68, 16, 95, 20, 0, 1.20, 24.00),
(69, 17, 1,  40, 0, 0.80, 32.00),     (70, 17, 6,  80, 0, 0.25, 20.00),     (71, 18, 35, 20, 0, 0.45, 9.00),     (72, 18, 37, 15, 0, 0.90, 13.50),
(73, 19, 1,  25, 25, 0.80, 20.00),    (74, 19, 4,  15, 15, 1.30, 19.50),    (75, 19, 6,  50, 50, 0.25, 12.50),   (76, 19, 9,  20, 20, 0.90, 18.00),
(77, 20, 53, 15, 0, 1.30, 19.50),     (78, 20, 56, 20, 0, 1.00, 20.00),     (79, 21, 75, 10, 0, 2.20, 22.00),    (80, 22, 43, 20, 20, 2.80, 56.00),
(81, 22, 46, 30, 30, 1.80, 54.00),    (82, 22, 47, 15, 15, 3.20, 48.00),    (83, 22, 48, 30, 30, 0.80, 24.00),   (84, 23, 18, 40, 20, 0.35, 14.00),
(85, 23, 22, 15, 15, 2.20, 33.00),    (86, 24, 25, 15, 0, 1.60, 24.00),     (87, 24, 26, 30, 0, 0.90, 27.00),    (88, 25, 65, 30, 30, 0.55, 16.50),
(89, 25, 67, 20, 20, 0.90, 18.00),    (90, 25, 70, 25, 25, 0.70, 17.50),    (91, 26, 93, 80, 0, 0.35, 28.00),    (92, 26, 94, 60, 0, 0.35, 21.00),
(93, 27, 6,  100, 100, 0.25, 25.00),  (94, 27, 13, 40, 40, 0.65, 26.00),    (95, 27, 54, 20, 20, 2.50, 50.00),   (96, 27, 99, 20, 20, 1.80, 36.00),
(97, 28, 4,  10, 0, 1.30, 13.00),     (98, 28, 7,  20, 0, 0.40, 8.00),      (99, 29, 54, 15, 0, 2.50, 37.50),    (100, 29, 57, 15, 0, 2.10, 31.50)
ON DUPLICATE KEY UPDATE id = VALUES(id);

-- ═══════════════════════════════════════════════════════════════════════════════
--  9. SALES  (500 sales over last 90 days — single INSERT statement)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Check if sales already exist first
SELECT COUNT(*) INTO @existing_sales FROM sales;

-- Only generate if fewer than 400 sales exist
INSERT INTO sales (user_id, subtotal, discount, tax, total, payment_method, customer_id, points_earned, points_redeemed, loyalty_discount, created_at)
SELECT
  -- user_id: weighted toward cashiers
  CASE FLOOR(RAND() * 10)
    WHEN 0 THEN 1 WHEN 1 THEN 2 WHEN 2 THEN 2 WHEN 3 THEN 2
    WHEN 4 THEN 3 WHEN 5 THEN 3 WHEN 6 THEN 3
    ELSE 4
  END,
  -- subtotal: $2-$50
  ROUND(2.00 + RAND() * 48.00, 2),
  -- discount: 0 or 5-15% of subtotal (40% chance)
  CASE WHEN RAND() < 0.4 THEN ROUND((2.00 + RAND() * 48.00) * (0.02 + RAND() * 0.13), 2) ELSE 0.00 END,
  -- tax: 10% of subtotal after discount
  ROUND((ROUND(2.00 + RAND() * 48.00, 2) - CASE WHEN RAND() < 0.4 THEN ROUND((2.00 + RAND() * 48.00) * (0.02 + RAND() * 0.13), 2) ELSE 0.00 END) * 0.10, 2),
  -- total: will be computed below
  0.00,
  -- payment_method: cash 45%, aba 35%, card 20%
  CASE WHEN RAND() < 0.45 THEN 'cash' WHEN RAND() < 0.80 THEN 'aba' ELSE 'card' END,
  -- customer_id: 80% assigned
  CASE WHEN RAND() < 0.8 THEN FLOOR(1 + RAND() * 45) ELSE NULL END,
  -- points_earned
  FLOOR((2.00 + RAND() * 48.00) * 10),
  -- points_redeemed: sometimes
  CASE WHEN RAND() < 0.3 THEN FLOOR(RAND() * 50) ELSE 0 END,
  -- loyalty_discount
  CASE WHEN RAND() < 0.3 THEN ROUND(FLOOR(RAND() * 50) * 0.01, 2) ELSE 0.00 END,
  -- created_at: uniform distribution over last 90 days
  NOW() - INTERVAL FLOOR(RAND() * 90) DAY - INTERVAL FLOOR(RAND() * 12) HOUR - INTERVAL FLOOR(RAND() * 60) MINUTE
FROM (
  -- Generate 500 rows using a number series
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
  UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) a CROSS JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
  UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) b CROSS JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) c
WHERE @existing_sales < 400
LIMIT 500;

-- Update the total column for all sales (subtotal - discount + tax - loyalty_discount)
UPDATE sales SET total = ROUND(subtotal - discount + tax - loyalty_discount, 2) WHERE total = 0;

-- ═══════════════════════════════════════════════════════════════════════════════
--  10. SALE ITEMS  (1-6 items per sale)
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT COUNT(*) INTO @existing_items FROM sale_items;

INSERT INTO sale_items (sale_id, product_id, quantity, price)
SELECT
  s.id,
  1 + FLOOR(RAND() * 100) AS product_id,
  1 + FLOOR(RAND() * 4) AS quantity,
  ROUND(0.50 + RAND() * 4.50, 2) AS price
FROM sales s
CROSS JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) nums
WHERE @existing_items < 500
  AND nums.n <= 1 + FLOOR(RAND() * 5)  -- 1-6 items per sale
ORDER BY RAND()
LIMIT 2500;

-- ═══════════════════════════════════════════════════════════════════════════════
--  11. STOCK MOVEMENTS  (260 movements)
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT COUNT(*) INTO @existing_moves FROM stock_movements;

INSERT INTO stock_movements (product_id, quantity, type, reference_type, reference_id, cost_price, price, note, performed_by, created_at)
SELECT
  1 + FLOOR(RAND() * 100),
  CASE
    WHEN RAND() < 0.35 THEN -1 - FLOOR(RAND() * 20)   -- sale: negative
    WHEN RAND() < 0.60 THEN 1 + FLOOR(RAND() * 20)    -- purchase: positive
    WHEN RAND() < 0.78 THEN 1 + FLOOR(RAND() * 10)    -- return: positive
    WHEN RAND() < 0.90 THEN -1 - FLOOR(RAND() * 5)    -- adjustment: negative
    ELSE -1 - FLOOR(RAND() * 3)                        -- damaged: negative
  END,
  CASE
    WHEN RAND() < 0.35 THEN 'sale'
    WHEN RAND() < 0.60 THEN 'purchase'
    WHEN RAND() < 0.78 THEN 'return'
    WHEN RAND() < 0.90 THEN 'adjustment'
    ELSE 'damaged'
  END,
  CASE
    WHEN RAND() < 0.35 THEN 'sale'
    WHEN RAND() < 0.60 THEN 'purchase_order'
    WHEN RAND() < 0.78 THEN 'return'
    ELSE NULL
  END,
  CASE
    WHEN RAND() < 0.35 THEN FLOOR(1 + RAND() * 500)
    WHEN RAND() < 0.60 THEN FLOOR(1 + RAND() * 30)
    WHEN RAND() < 0.78 THEN FLOOR(1 + RAND() * 30)
    ELSE NULL
  END,
  ROUND(0.50 + RAND() * 3.00, 2),
  ROUND(1.00 + RAND() * 5.00, 2),
  'Demo data seed',
  1 + FLOOR(RAND() * 3),
  NOW() - INTERVAL FLOOR(RAND() * 90) DAY
FROM (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
  UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) a CROSS JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
  UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) b CROSS JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3
) c
WHERE @existing_moves < 200
LIMIT 260;

-- ═══════════════════════════════════════════════════════════════════════════════
--  12. RETURNS  (30 returns)
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT COUNT(*) INTO @existing_returns FROM returns;
SELECT MAX(id) INTO @max_sale_id FROM sales;

INSERT INTO returns (sale_id, total, status, reason, processed_by, created_at)
SELECT
  FLOOR(1 + RAND() * @max_sale_id),
  ROUND(2.00 + RAND() * 20.00, 2),
  CASE WHEN RAND() < 0.5 THEN 'approved' WHEN RAND() < 0.8 THEN 'pending' ELSE 'rejected' END,
  CASE WHEN RAND() < 0.33 THEN 'Customer changed mind'
       WHEN RAND() < 0.66 THEN 'Product damaged'
       ELSE 'Wrong item purchased' END,
  1 + FLOOR(RAND() * 3),
  NOW() - INTERVAL FLOOR(RAND() * 60) DAY
FROM (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
  UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) a CROSS JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3
) b
WHERE @existing_returns < 15
LIMIT 30;

-- ═══════════════════════════════════════════════════════════════════════════════
--  13. RETURN ITEMS  (1-3 items per return)
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT COUNT(*) INTO @existing_return_items FROM return_items;

INSERT INTO return_items (return_id, product_id, quantity, price, refund_amount)
SELECT
  r.id,
  1 + FLOOR(RAND() * 100),
  1 + FLOOR(RAND() * 3),
  ROUND(1.00 + RAND() * 5.00, 2),
  ROUND(1.00 + RAND() * 5.00, 2)
FROM returns r
CROSS JOIN (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3
) nums
WHERE @existing_return_items < 10
  AND nums.n <= 1 + FLOOR(RAND() * 2)
ORDER BY RAND()
LIMIT 90;

-- ═══════════════════════════════════════════════════════════════════════════════
--  Update product stock based on stock movements (sale reduces, purchase/return increases)
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE products p
SET p.stock = p.stock + COALESCE((
  SELECT SUM(sm.quantity)
  FROM stock_movements sm
  WHERE sm.product_id = p.id
), 0);

-- Ensure stock never goes below 0
UPDATE products SET stock = GREATEST(stock, 0) WHERE stock < 0;

-- ═══════════════════════════════════════════════════════════════════════════════
--  Update customer total_spent and total_purchases from sales
-- ═══════════════════════════════════════════════════════════════════════════════
UPDATE customers c
SET c.total_spent = COALESCE((
  SELECT SUM(s.total) FROM sales s WHERE s.customer_id = c.id
), 0),
c.total_purchases = COALESCE((
  SELECT COUNT(*) FROM sales s WHERE s.customer_id = c.id
), 0);

-- ═══════════════════════════════════════════════════════════════════════════════
--  VERIFICATION QUERIES  — run these to confirm data was inserted
-- ═══════════════════════════════════════════════════════════════════════════════
SELECT 'USERS' AS `table`, COUNT(*) AS `count` FROM users
UNION ALL SELECT 'CATEGORIES', COUNT(*) FROM categories
UNION ALL SELECT 'CUSTOMERS', COUNT(*) FROM customers
UNION ALL SELECT 'SUPPLIERS', COUNT(*) FROM suppliers
UNION ALL SELECT 'PRODUCTS', COUNT(*) FROM products
UNION ALL SELECT 'QUICK PICKS', COUNT(*) FROM quick_picks
UNION ALL SELECT 'PURCHASE ORDERS', COUNT(*) FROM purchase_orders
UNION ALL SELECT 'PO ITEMS', COUNT(*) FROM purchase_order_items
UNION ALL SELECT 'SALES', COUNT(*) FROM sales
UNION ALL SELECT 'SALE ITEMS', COUNT(*) FROM sale_items
UNION ALL SELECT 'STOCK MOVEMENTS', COUNT(*) FROM stock_movements
UNION ALL SELECT 'RETURNS', COUNT(*) FROM returns
UNION ALL SELECT 'RETURN ITEMS', COUNT(*) FROM return_items
ORDER BY `table`;
