-- Inizializzazione database Art Management Tool
-- Questo script viene eseguito automaticamente alla prima creazione del container

-- Estensione per UUID (opzionale, utile per future features)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- La tabella personaggi verrà creata automaticamente da GORM AutoMigrate
-- Questo file è preparato per eventuali dati iniziali o configurazioni

-- Inserimento dati di esempio (opzionale - decommentare se necessario)
/*
INSERT INTO personaggi (name, description, icon, images, background_color, background_type, "order", created_at, updated_at)
VALUES 
  ('Ribelle il Pigro', 'Il protagonista della nostra galleria d''arte', '/personaggi/ribelle/Ribelle_icon.png', 
   '[]'::jsonb, '#E0E7FF', 'solid', 1, NOW(), NOW()),
  ('Giullare', 'Il giullare della corte', '/personaggi/giullare/Giullare_icon.png', 
   '[]'::jsonb, '#FEF3C7', 'solid', 2, NOW(), NOW()),
  ('Leon', 'Il leone coraggioso', '/personaggi/leon/Leon_icon.png', 
   '[]'::jsonb, '#DBEAFE', 'solid', 3, NOW(), NOW()),
  ('Polemico', 'Il personaggio più discusso', '/personaggi/polemico/Polemico_icon.png', 
   '[]'::jsonb, '#FCE7F3', 'solid', 4, NOW(), NOW());
*/

-- Index per migliorare le performance
-- GORM crea automaticamente gli indici necessari, ma puoi aggiungerne di custom qui
-- CREATE INDEX IF NOT EXISTS idx_personaggi_order ON personaggi("order");
-- CREATE INDEX IF NOT EXISTS idx_personaggi_deleted_at ON personaggi(deleted_at);
