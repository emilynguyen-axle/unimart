-- ============================================================
-- UniMart — Sprint 3 Products Seed Fix
-- Replace the products insert in 02_seed.sql with this
-- ============================================================

INSERT INTO public.products (title, description, vertical, price, category, allergens, tags, in_stock, stock_count)
VALUES
  ('Organic Olive Oil 500ml',      'Cold-pressed extra virgin olive oil',            'Shop',          12.99, 'Pantry',   '{}',                        '{organic,pantry,cooking}',       true, 50),
  ('Bamboo Cutting Board Set',     'Set of 3 sustainably sourced bamboo boards',      'Shop',          24.99, 'Kitchen',  '{}',                        '{kitchen,eco,gift}',             true, 50),
  ('Oat Milk 1L',                  'Barista-grade oat milk, no added sugar',          'Shop',           3.49, 'Drinks',   '{}',                        '{vegan,dairy-free,drinks}',      true, 50),
  ('Thai Green Curry Kit',         'Authentic Thai curry kit for 2, ready in 25min',  'Meal Kits',     12.99, 'Asian',    '{fish,soy}',                '{thai,spicy,quick}',             true, 50),
  ('Mushroom Risotto Kit',         'Creamy Italian risotto with wild mushrooms',       'Meal Kits',     11.99, 'Italian',  '{dairy,gluten}',            '{vegetarian,italian,comfort}',   true, 50),
  ('Vegan Pad Thai Kit',           'Classic pad thai with tofu, serves 2',            'Meal Kits',     10.99, 'Asian',    '{soy,peanuts}',             '{vegan,thai,quick}',             true, 50),
  ('Wagamama Ramen Bowl',          'Tonkotsu ramen with pork belly and soft egg',     'Food Delivery',  16.50, 'Japanese', '{gluten,eggs,dairy}',       '{ramen,japanese,popular}',       true, 50),
  ('Dishoom Breakfast Bun',        'Bacon naan roll with chilli butter',              'Food Delivery',  12.00, 'Indian',   '{gluten,dairy}',            '{breakfast,indian,popular}',     true, 50),
  ('Pizza Margherita',             'Classic wood-fired margherita, 12 inch',          'Food Delivery',  14.00, 'Italian',  '{gluten,dairy}',            '{pizza,italian,classic}',        true, 50)
ON CONFLICT DO NOTHING;
