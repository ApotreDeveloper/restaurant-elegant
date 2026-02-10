
-- 1. RESTAURANTS
INSERT INTO restaurants (name, description, tagline, address, phone, email, opening_hours, social_links)
VALUES (
    'Le Gourmet Élégant',
    'Une expérience gastronomique inoubliable au cœur de Paris. Tradition, innovation et passion dans chaque assiette depuis 1995.',
    'L''élégance à la française',
    '123 Avenue des Champs-Élysées, 75008 Paris',
    '+33 1 23 45 67 89',
    'contact@legourmet.fr',
    '{"monday": "Fermé", "tuesday": "18:00-23:00", "wednesday": "18:00-23:00", "thursday": "18:00-23:00", "friday": "18:00-23:00", "saturday": "18:00-23:00", "sunday": "12:00-14:30, 18:00-23:00"}',
    '{"facebook": "#", "instagram": "#", "twitter": "#"}'
);

-- 2. MENU CATEGORIES
INSERT INTO menu_categories (name, description, display_order) VALUES
('Entrées', 'Pour commencer le voyage', 1),
('Plats Principaux', 'Le cœur de notre cuisine', 2),
('Desserts', 'La touche sucrée', 3),
('Vins & Boissons', 'Accords parfaits', 4);

-- 3. MENU ITEMS (ENTREES)
WITH cat AS (SELECT id FROM menu_categories WHERE name = 'Entrées' LIMIT 1)
INSERT INTO menu_items (category_id, name, description, price, image_url, allergens, is_daily_special)
SELECT id, 'Foie Gras de Canard', 'Mi-cuit maison, chutney de figues fraîches, brioche toastée à la fleur de sel.', 18500, 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&q=80', ARRAY['Gluten', 'Œufs', 'Lactose'], true FROM cat
UNION ALL
SELECT id, 'Escargots de Bourgogne', 'Douzaine d''escargots sauvages, beurre persillé, ail, fines herbes.', 12000, 'https://images.unsplash.com/photo-1608666521360-192b1a1a9712?w=800&q=80', ARRAY['Lactose'], false FROM cat
UNION ALL
SELECT id, 'Velouté de Potimarron', 'Crème de potimarron, éclats de châtaignes et huile de truffe blanche.', 9500, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80', ARRAY['Lactose'], false FROM cat;

-- 3. MENU ITEMS (PLATS)
WITH cat AS (SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1)
INSERT INTO menu_items (category_id, name, description, price, image_url, allergens, is_daily_special)
SELECT id, 'Filet de Bœuf Rossini', 'Cœur de filet, escalope de foie gras poêlée, sauce périgueux aux truffes.', 29500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', ARRAY['Gluten', 'Lactose'], false FROM cat
UNION ALL
SELECT id, 'Saint-Jacques Rôties', 'Noix de Saint-Jacques fraîches, purée de céleri rave, beurre blanc au citron vert.', 25000, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80', ARRAY['Fruits de mer', 'Lactose'], true FROM cat
UNION ALL
SELECT id, 'Homard Bleu Breton', 'Rôti au beurre demi-sel, légumes glacés, bisque crémée au cognac.', 34000, 'https://images.unsplash.com/photo-1553163147-621957516d36?w=800&q=80', ARRAY['Fruits de mer', 'Lactose'], false FROM cat;

-- 3. MENU ITEMS (DESSERTS)
WITH cat AS (SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1)
INSERT INTO menu_items (category_id, name, description, price, image_url, allergens, is_daily_special)
SELECT id, 'Soufflé au Grand Marnier', 'Aérien et parfumé, servi avec sa glace vanille bourbon.', 10500, 'https://images.unsplash.com/photo-1548811264-b3e34b7b2586?w=800&q=80', ARRAY['Œufs', 'Lactose', 'Gluten'], false FROM cat
UNION ALL
SELECT id, 'Paris-Brest', 'Pâte à choux croustillante, crème mousseline pralinée, noisettes torréfiées.', 9000, 'https://images.unsplash.com/photo-1601614838682-1d575232701e?w=800&q=80', ARRAY['Gluten', 'Œufs', 'Lactose', 'Fruits à coque'], true FROM cat;

-- 4. ABOUT PAGE
INSERT INTO about_page (title, content, mission, vision, team_members)
VALUES (
    'À Propos de Nous',
    '<p>Fondé en 1995 par le Chef Auguste Gusteau, <strong>Le Gourmet Élégant</strong> est né d''une vision simple : sublimer les classiques de la gastronomie française.</p>',
    'Offrir une expérience sensorielle inoubliable où chaque plat raconte une histoire.',
    'Devenir la référence incontournable de la haute gastronomie française.',
    '[
        {"name": "Auguste Gusteau", "role": "Chef Exécutif", "bio": "30 ans d''expérience.", "photo_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80"},
        {"name": "Camille Dubois", "role": "Chef Sommelière", "bio": "Meilleure Ouvrière de France.", "photo_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"},
        {"name": "Marc Levy", "role": "Directeur de Salle", "bio": "L''orchestre du service.", "photo_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"}
    ]'::jsonb
);

-- 5. GALLERY
INSERT INTO gallery (title, description, image_url, category, is_featured, display_order) VALUES
('Salle Principale', 'Ambiance feutrée', 'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=1200', 'restaurant', true, 1),
('Homard Bleu', 'Signature du Chef', 'https://images.unsplash.com/photo-1553163147-621957516d36?q=80&w=1200', 'dishes', true, 2),
('Soirée Jazz', 'Concert privé', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200', 'events', false, 3);

-- 6. BLOG POSTS
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, status, published_at, category, read_time) VALUES
('La nouvelle carte d''été est arrivée', 'nouvelle-carte-ete-2024', 'Découvrez nos saveurs ensoleillées.', '<p>L''été est enfin là...</p>', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200', 'published', NOW() - INTERVAL '2 days', 'Menu', 4),
('Les secrets du soufflé', 'secrets-du-souffle', 'Comment réussir ce classique ?', '<p>Le secret réside dans...</p>', 'https://images.unsplash.com/photo-1548811264-b3e34b7b2586?w=1200', 'draft', NULL, 'Cuisine', 6);

-- 7. REVIEWS
INSERT INTO reviews (customer_name, rating, comment, status) VALUES
('Jean Dupont', 5, 'Exceptionnel ! Une soirée parfaite.', 'approved'),
('Marie Curie', 5, 'Une symphonie de saveurs.', 'approved'),
('Paul Martin', 4, 'Très bon mais un peu bruyant.', 'approved'),
('Alice Wonderland', 3, 'Service un peu long.', 'pending'),
('Bob Builder', 5, 'Incroyable architecture dans l''assiette.', 'pending');

-- 8. NAVIGATION
INSERT INTO navigation_menu (label, url, display_order) VALUES
('Accueil', '/', 1),
('Menu', '/menu', 2),
('Réservation', '/reservation', 3),
('Commander', '/commande', 4),
('Blog', '/blog', 5);
