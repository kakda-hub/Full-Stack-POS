-- Ensure your products table has the img_url column
-- Columns: (name, name_kh, barcode, price, stock, category_id, description, img_url, is_active)
-- Categories: 1=Beverages, 2=Snacks & Sweets, 3=Groceries, 4=Dairy, 5=Personal Care, 6=Household Goods

INSERT IGNORE INTO products (name, name_kh, barcode, price, stock, category_id, description, img_url, is_active) VALUES

-- ==========================================
-- CATEGORY 1: Beverages (ភេសជ្ជៈ)
-- ==========================================
('Vital Premium Water 500ml', 'ទឹកបរិសុទ្ធវីតាល់ ៥០០មល', '884000101001', 0.25, 500, 1, 'Local premium water', 'https://images.unsplash.com/photo-1560313050-652f10d9f000?q=80&w=400', 1),
('Dasani Water 1.5L', 'ទឹកបរិសុទ្ធដាសានី ១.៥លីត្រ', '884000101002', 0.60, 200, 1, 'Bottled water', 'https://images.unsplash.com/photo-1559839914-17aae19cec71?q=80&w=400', 1),
('Coca Cola 330ml Can', 'កូកាកូឡា កំប៉ុង', '884000101003', 0.60, 240, 1, 'Carbonated drink', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400', 1),
('Pepsi 330ml Can', 'ភេសជ្ជៈប៉ិបស៊ី កំប៉ុង', '884000101004', 0.55, 240, 1, 'Carbonated drink', 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?q=80&w=400', 1),
('Sting Energy Red 330ml', 'ស្ទីងក្រហម កំប៉ុង', '884000101005', 0.65, 150, 1, 'Energy drink', 'https://images.unsplash.com/photo-1622543925917-763c34d1538c?q=80&w=400', 1),
('Carabao Energy 250ml', 'ការ៉ាបាវ កំប៉ុង', '884000101006', 0.60, 120, 1, 'Energy drink', 'https://images.unsplash.com/photo-1613511333411-e737190f898a?q=80&w=400', 1),
('Angkor Beer 330ml Can', 'ស្រាបៀរអង្គរ កំប៉ុង', '884000101007', 0.75, 480, 1, 'Local beer', 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9?q=80&w=400', 1),
('Cambodia Beer 330ml Can', 'ស្រាបៀរកម្ពុជា កំប៉ុង', '884000101008', 0.75, 480, 1, 'Local beer', 'https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?q=80&w=400', 1),
('Oishi Green Tea 380ml', 'តែបៃតងអូអ៊ីឈិ', '884000101009', 0.85, 100, 1, 'Green tea bottle', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=400', 1),
('Nescafe Iced Coffee 180ml', 'កាហ្វេកំប៉ុងណេសកាហ្វេ', '884000101010', 0.70, 120, 1, 'Ready to drink coffee', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400', 1),

-- ==========================================
-- CATEGORY 2: Snacks & Sweets (នំចំណី និងអាហារសម្រន់)
-- ==========================================
('Lay''s Rock Potato Chips 50g', 'នំឡេ កញ្ចប់', '884000102001', 1.10, 60, 2, 'Classic potato chips', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=400', 1),
('Pringles Sour Cream 107g', 'នំប្រ៊ីងហ្គល កំប៉ុង', '884000102002', 1.95, 40, 2, 'Potato crisps', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400', 1),
('Oreo Sandwich Cookies 133g', 'នំអូរីអូ', '884000102003', 1.00, 80, 2, 'Chocolate cookies', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400', 1),
('KitKat 4 Finger 45g', 'នំឃីតឃីត', '884000102004', 0.90, 100, 2, 'Chocolate bar', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=400', 1),
('Snickers Chocolate 50g', 'សូកូឡាស្នីឃ័រ', '884000102005', 0.95, 100, 2, 'Peanut chocolate', 'https://images.unsplash.com/photo-1592722544189-79bbc10b379c?q=80&w=400', 1),
('Testo Potato Chips 52g', 'នំតេស្តូ កញ្ចប់', '884000102006', 0.75, 60, 2, 'Potato chips', 'https://images.unsplash.com/photo-1621447509374-f4460773d9d3?q=80&w=400', 1),
('Pocky Chocolate 45g', 'នំប៉ុកគី រសជាតិសូកូឡា', '884000102007', 0.85, 50, 2, 'Biscuit sticks', 'https://images.unsplash.com/photo-1635315804791-0309995543be?q=80&w=400', 1),
('Euro Cake Custard', 'នំយូរ៉ូ ខេក', '884000102008', 0.25, 120, 2, 'Soft cake', 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=400', 1),
('Jack n Jill Dewberry', 'នំឌូយប៊ឺរី', '884000102009', 0.40, 90, 2, 'Strawberry cream cookies', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=400', 1),
('M&M Peanut 45g', 'ស្ករគ្រាប់ M&M', '884000102010', 1.05, 50, 2, 'Candy coated chocolate', 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?q=80&w=400', 1),

-- ==========================================
-- CATEGORY 3: Groceries (អាហារក្រៀម និងគ្រឿងទេស)
-- ==========================================
('Mama Instant Noodle Pork 60g', 'មីម៉ាម៉ា រសជាតិសាច់ជ្រូក', '884000103001', 0.25, 600, 3, 'Popular instant noodles', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=400', 1),
('Indomie Mi Goreng 80g', 'មីឥណ្ឌូមី រសជាតិហិរ', '884000103002', 0.35, 300, 3, 'Fried noodles', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=400', 1),
('Ayam Brand Sardines 155g', 'ត្រីខកំប៉ុងអាយ៉ាម', '884000103003', 1.25, 48, 3, 'Premium canned sardines', 'https://images.unsplash.com/photo-1623337920150-13f8c8574187?q=80&w=400', 1),
('Chef''s Choice Tuna 185g', 'ត្រីធូណាកំប៉ុង', '884000103004', 1.85, 30, 3, 'Canned tuna in oil', 'https://images.unsplash.com/photo-1599121105032-93bc9fa0042c?q=80&w=400', 1),
('Knorr Chicken Powder 150g', 'ម្សៅស៊ុបខ្នរ រសជាតិមាន់', '884000103005', 1.45, 40, 3, 'Seasoning powder', 'https://images.unsplash.com/photo-1589113103503-49479911bd31?q=80&w=400', 1),
('Maggi Soy Sauce 200ml', 'ទឹកស៊ីអ៊ីវម៉ាជី', '884000103006', 1.10, 50, 3, 'Soy sauce bottle', 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?q=80&w=400', 1),
('Healthy Boy Oyster Sauce 350g', 'ប្រេងខ្យងហែលធីប៊យ', '884000103007', 1.65, 40, 3, 'Oyster sauce', 'https://images.unsplash.com/photo-1608797178974-15b35a6401c2?q=80&w=400', 1),
('Siam Diamond Oil 1L', 'ប្រេងឆាពេជ្រសៀម ១លីត្រ', '884000103008', 1.80, 60, 3, 'Cooking oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400', 1),
('A-One Cup Noodle Seafood', 'មីកំប៉ុង A-One', '884000103009', 0.50, 120, 3, 'Cup noodles', 'https://images.unsplash.com/photo-1627662168306-ee80961e8aa2?q=80&w=400', 1),
('Malys Rice Premium 5kg', 'អង្ករម៉ាលីស ៥គីឡូ', '884000103010', 6.50, 20, 3, 'Premium jasmine rice', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400', 1),

-- ==========================================
-- CATEGORY 4: Dairy & Chilled (ផលិតផលទឹកដោះគោ និងអាហារត្រជាក់)
-- ==========================================
('Meiji Fresh Milk 450ml', 'ទឹកដោះគោស្រស់មេជី', '884000104001', 1.50, 20, 4, 'Fresh cow milk', 'https://images.unsplash.com/photo-1563636619-e910009355dc?q=80&w=400', 1),
('Dutch Mill Yogurt Drink', 'ទឹកដោះគោជូរដាច់មីល', '884000104002', 0.55, 60, 4, 'Yogurt drink mixed fruit', 'https://images.unsplash.com/photo-1563223552-30d01fda3ead?q=80&w=400', 1),
('CP Fresh Eggs (Pack 10)', 'ស៊ុតមាន់ CP ១ប្រអប់', '884000104003', 1.65, 30, 4, 'Fresh chicken eggs', 'https://images.unsplash.com/photo-1516746952756-ad264ec4625e?q=80&w=400', 1),
('Anchor Salted Butter 227g', 'ប៊ឺអង់ខ័រ', '884000104004', 3.80, 15, 4, 'Premium butter', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=400', 1),
('Laughing Cow Cheese (8pcs)', 'ឈីសរូបក្បាលគោ', '884000104005', 2.25, 25, 4, 'Cheese spread wedges', 'https://images.unsplash.com/photo-1624806994096-7f2015098352?q=80&w=400', 1),
('Walls Cornetto Chocolate', 'ការ៉េមខនណេតតូ', '884000104006', 0.85, 40, 4, 'Ice cream cone', 'https://images.unsplash.com/photo-1501443762994-82bd5dabb892?q=80&w=400', 1),
('Yakult Probiotic Drink 80ml', 'យ៉ាគូល', '884000104007', 0.35, 100, 4, 'Probiotic milk', 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=400', 1),
('Foremost UHT Milk 225ml', 'ទឹកដោះគោហ្វ័រម៉ូស', '884000104008', 0.60, 80, 4, 'UHT milk box', 'https://images.unsplash.com/photo-1550583724-125581f77833?q=80&w=400', 1),
('Magnolia Ice Cream 1L', 'ការ៉េមម៉ាកណូលីយ៉ា ១លីត្រ', '884000104009', 4.50, 10, 4, 'Ice cream tub', 'https://images.unsplash.com/photo-1560008511-11c63416e52d?q=80&w=400', 1),
('Dumex Milk Powder 600g', 'ម្សៅទឹកដោះគោឌូមិច', '884000104010', 8.50, 12, 4, 'Instant milk powder', 'https://images.unsplash.com/photo-1620189507187-19607699923b?q=80&w=400', 1),

-- ==========================================
-- CATEGORY 5: Personal Care (របស់ប្រើប្រាស់ផ្ទាល់ខ្លួន)
-- ==========================================
('Clear Shampoo 480ml', 'សាប៊ូកក់សក់ក្លៀរ', '884000105001', 4.80, 20, 5, 'Anti-dandruff shampoo', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=400', 1),
('Dove Body Wash 500ml', 'សាប៊ូដុសខ្លួនដូវ', '884000105002', 5.20, 15, 5, 'Moisturizing body wash', 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=400', 1),
('Colgate Triple Action 150g', 'ថ្នាំដុសធ្មេញកុលហ្គេត', '884000105003', 1.70, 40, 5, 'Fluoride toothpaste', 'https://images.unsplash.com/photo-1559594411-6ad023e0339a?q=80&w=400', 1),
('Oral-B Toothbrush Soft', 'ច្រាសដុសធ្មេញ Oral-B', '884000105004', 1.20, 50, 5, 'Soft bristles toothbrush', 'https://images.unsplash.com/photo-1553531087-b25a0b9a83aa?q=80&w=400', 1),
('Lux Soap Bar 100g', 'សាប៊ូដុំឡាក់', '884000105005', 0.70, 100, 5, 'Fragrance soap bar', 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=400', 1),
('Nivea Men Face Wash 100g', 'សាប៊ូលាងមុខនីវ៉េបុរស', '884000105006', 3.50, 25, 5, 'Deep clean face wash', 'https://images.unsplash.com/photo-1556229162-5c63ed9c4ffb?q=80&w=400', 1),
('Vaseline Body Lotion 400ml', 'ឡេលាបខ្លួនវ៉ាសឺលីន', '884000105007', 5.50, 15, 5, 'Whitening body lotion', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=400', 1),
('Kotex Soft & Smooth', 'សំឡីអនាម័យកូតេច', '884000105008', 1.50, 40, 5, 'Sanitary pads', 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?q=80&w=400', 1),
('Scott Tissue Roll', 'ក្រដាសអនាម័យស្កុត', '884000105009', 0.45, 200, 5, 'Bathroom tissue', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=400', 1),
('Listerine Cool Mint 250ml', 'ទឹកខ្ពុរមាត់លីស្ទឺរីន', '884000105010', 2.75, 20, 5, 'Mouthwash', 'https://images.unsplash.com/photo-1559594482-9c5acd23f2ec?q=80&w=400', 1),

-- ==========================================
-- CATEGORY 6: Household Goods (របស់ប្រើប្រាស់ក្នុងផ្ទះ)
-- ==========================================
('Sunlight Lemon 400ml', 'សាប៊ូលាងចានសាន់ឡាយ', '884000106001', 0.90, 100, 6, 'Dishwashing liquid', 'https://images.unsplash.com/photo-1584622781514-f63f769c1340?q=80&w=400', 1),
('Viso Phat Phat Detergent 800g', 'សាប៊ូបោកខោអាវវីសូ', '884000106002', 1.50, 50, 6, 'Laundry detergent powder', 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=400', 1),
('Comfort Blue 580ml', 'ទឹកក្រអូបកំហ្វត ពណ៌ខៀវ', '884000106003', 2.15, 40, 6, 'Fabric softener', 'https://images.unsplash.com/photo-1560155016-bd4879ae8f21?q=80&w=400', 1),
('Magiclean Floor Cleaner 750ml', 'ទឹកជូតការ៉ូ Magiclean', '884000106004', 2.30, 20, 6, 'Floor cleaning liquid', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400', 1),
('Baygon Mosquito Spray 300ml', 'ថ្នាំបាញ់មូសបៃហ្គន', '884000106005', 3.20, 20, 6, 'Insecticide spray', 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?q=80&w=400', 1),
('Duck Bathroom Cleaner 900ml', 'ទឹកលាងបង្គន់ទា', '884000106006', 2.50, 25, 6, 'Toilet bowl cleaner', 'https://images.unsplash.com/photo-1585832770485-e289c1e673f5?q=80&w=400', 1),
('Scotch-Brite Sponge (Pack 3)', 'ស្បៃលាងចាន Scotch-Brite', '884000106007', 1.35, 60, 6, 'Scrub sponge', 'https://images.unsplash.com/photo-1585832997273-2bb0832ec518?q=80&w=400', 1),
('BIC Lighter Classic', 'ដែកកេះ BIC', '884000106008', 0.50, 100, 6, 'Disposable lighter', 'https://images.unsplash.com/photo-1523419073030-94d039755490?q=80&w=400', 1),
('Panasonic AA Battery (2pcs)', 'ថ្មពិលប៉ាណាសូនិច AA', '884000106009', 0.90, 80, 6, 'Alkaline batteries', 'https://images.unsplash.com/photo-1590333746433-87f547c13e51?q=80&w=400', 1),
('Glad Cling Wrap 30m', 'ផ្លាស្ទិកខ្ចប់អាហារ', '884000106010', 2.10, 15, 6, 'Food wrap film', 'https://images.unsplash.com/photo-1601614742614-722165f128be?q=80&w=400', 1);
