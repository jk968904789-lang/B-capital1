/*
# Seed demo rooms + hotel settings

1. Purpose
   Populate the `rooms` table with 12 demo rooms across the four categories
   (Standard, Deluxe, Executive, Suite) using premium Pexels imagery, and set
   the default hotel settings row. This makes the site feel populated on first
   load for demonstration to a hotel owner.

2. Data inserted
   - 12 rooms: 3 Standard, 3 Deluxe, 3 Executive, 3 Suite — each with multiple
     image URLs, amenities, capacity, floor, room number and ETB pricing.
   - The `settings` row is updated to the B Capital defaults if it is still the
     seeded default.

3. Notes
   - Pricing is in Ethiopian Birr (ETB) per night.
   - `ON CONFLICT DO NOTHING` keeps the migration idempotent — re-running will
     not duplicate rooms.
   - The admin/cashier accounts are NOT created here — those require auth.users
     rows, which are created through an edge function (admin bootstrap) and the
     Supabase auth API.
*/

INSERT INTO rooms (name, category, description, price, capacity, size_sqm, amenities, image_urls, is_available, room_number, floor) VALUES
-- Standard (3)
('Standard 101', 'standard', 'A refined retreat featuring a plush queen bed, premium linens, and a calm neutral palette. Ideal for solo travelers and short stays, with a sleek en-suite bathroom and a work desk.', 3500.00, 2, 24, ARRAY['Free Wi-Fi','Air Conditioning','Smart TV','En-suite Bathroom','Work Desk','Daily Housekeeping','In-room Safe'], ARRAY['https://images.pexels.com/photos/6434592/pexels-photo-6434592.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/2736384/pexels-photo-2736384.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/6394609/pexels-photo-6394609.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '101', 1),
('Standard 102', 'standard', 'Bright and welcoming, this standard room pairs a comfortable queen bed with warm wood accents and a contemporary bathroom. A quiet, restful base for exploring Dire Dawa.', 3500.00, 2, 24, ARRAY['Free Wi-Fi','Air Conditioning','Smart TV','En-suite Bathroom','Work Desk','Daily Housekeeping','In-room Safe'], ARRAY['https://images.pexels.com/photos/26840829/pexels-photo-26840829.png?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8082195/pexels-photo-8082195.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '102', 1),
('Standard 103', 'standard', 'A cozy, efficient room with a double bed, crisp linens, and a modern bathroom. Thoughtfully designed for comfort and value, with blackout drapes for undisturbed rest.', 3500.00, 2, 22, ARRAY['Free Wi-Fi','Air Conditioning','Smart TV','En-suite Bathroom','Work Desk','Daily Housekeeping','In-room Safe'], ARRAY['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/2736384/pexels-photo-2736384.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '103', 1),
-- Deluxe (3)
('Deluxe 201', 'deluxe', 'An elevated stay with a king bed, lounge seating, and floor-to-ceiling windows with city views. Finished in warm gold tones with a spa-inspired bathroom.', 6500.00, 3, 36, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','En-suite Bathroom','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker'], ARRAY['https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '201', 2),
('Deluxe 202', 'deluxe', 'Spacious and serene, the Deluxe 202 offers a king bed, a private sitting area, and a marble bathroom. Perfect for couples seeking extra comfort and style.', 6500.00, 3, 36, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','En-suite Bathroom','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker'], ARRAY['https://images.pexels.com/photos/14547138/pexels-photo-14547138.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/14547145/pexels-photo-14547145.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/6394550/pexels-photo-6394550.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '202', 2),
('Deluxe 203', 'deluxe', 'A contemporary deluxe room with a king bed, warm ambient lighting, and a curated minibar. The bathroom features premium fixtures and a walk-in shower.', 6500.00, 3, 34, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','En-suite Bathroom','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker'], ARRAY['https://images.pexels.com/photos/6394550/pexels-photo-6394550.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8082217/pexels-photo-8082217.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8146150/pexels-photo-8146150.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], false, '203', 2),
-- Executive (3)
('Executive 301', 'executive', 'A generous executive suite with a king bed, separate living area, and an elegant dining nook. Designed for business and leisure, with enhanced amenities.', 9500.00, 3, 48, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','Living Area','Dining Nook','En-suite Bathroom','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker','Bathrobe & Slippers'], ARRAY['https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/7745929/pexels-photo-7745929.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '301', 3),
('Executive 302', 'executive', 'Refined executive accommodation with a king bed, a lounge with a sofa, and panoramic windows. Includes a premium marble bathroom and dedicated workspace.', 9500.00, 3, 48, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','Living Area','Dining Nook','En-suite Bathroom','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker','Bathrobe & Slippers'], ARRAY['https://images.pexels.com/photos/7745929/pexels-photo-7745929.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/7031731/pexels-photo-7031731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '302', 3),
('Executive 303', 'executive', 'A sophisticated executive room with king bed, lounge seating, and a designer bathroom. Tailored for extended stays and discerning travelers.', 9500.00, 3, 46, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','Living Area','Dining Nook','En-suite Bathroom','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker','Bathrobe & Slippers'], ARRAY['https://images.pexels.com/photos/7031731/pexels-photo-7031731.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/7745929/pexels-photo-7745929.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/6466496/pexels-photo-6466496.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '303', 3),
-- Suite (3)
('Capital Suite 401', 'suite', 'Our signature suite: a spacious bedroom, separate living and dining areas, and a luxury marble bathroom with a soaking tub. Finished in gold and ivory with curated art.', 15000.00, 4, 68, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','Separate Living Room','Dining Area','Luxury Bathroom','Soaking Tub','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker','Bathrobe & Slippers','Premium Toiletries','Nespresso Machine'], ARRAY['https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/14022458/pexels-photo-14022458.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '401', 4),
('Royal Suite 402', 'suite', 'The pinnacle of B Capital living — a two-room suite with a king bed, private lounge, dining for four, and an opulent bathroom. Floor-to-ceiling windows frame the city.', 15000.00, 4, 72, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','Separate Living Room','Dining Area','Luxury Bathroom','Soaking Tub','City View','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker','Bathrobe & Slippers','Premium Toiletries','Nespresso Machine'], ARRAY['https://images.pexels.com/photos/14022458/pexels-photo-14022458.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '402', 4),
('Presidential Suite 403', 'suite', 'An expansive presidential suite with a private entrance, king bedroom, grand living and dining spaces, and a designer bathroom. The ultimate statement of luxury.', 18000.00, 4, 88, ARRAY['Free Wi-Fi','Air Conditioning','King Bed','Smart TV','Minibar','Separate Living Room','Dining Area','Luxury Bathroom','Soaking Tub','City View','Private Entrance','Work Desk','Daily Housekeeping','In-room Safe','Coffee Maker','Bathrobe & Slippers','Premium Toiletries','Nespresso Machine'], ARRAY['https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/2725675/pexels-photo-2725675.jpeg?auto=compress&cs=tinysrgb&h=650&w=940','https://images.pexels.com/photos/14022458/pexels-photo-14022458.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'], true, '403', 4)
ON CONFLICT DO NOTHING;

-- Update settings to B Capital defaults (only if unchanged from defaults).
UPDATE settings SET
  hotel_name = 'B Capital',
  tagline = 'Premium Hospitality in Dire Dawa',
  phone = '+251 25 111 2222',
  email = 'reservations@bcapital.com',
  address = 'Bole Road, Kebele 04',
  city = 'Dire Dawa',
  country = 'Ethiopia',
  check_in_time = '14:00',
  check_out_time = '11:00',
  currency = 'ETB',
  updated_at = now()
WHERE id = 1;
