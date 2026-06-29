-- ============================================
-- Script de inserción de datos iniciales
-- Sistema de Turnos - Nazareno Hairdressing
-- MySQL 8.0
-- ============================================

USE turnero;

-- ============================================
-- 🏪 BARBERÍA: Nazareno Hairdressing
-- ============================================
INSERT INTO barberias (nombre, slug, email, telefono, activa, creada_en)
SELECT 
    'Nazareno Hairdressing' AS nombre,
    'nazareno-hairdressing' AS slug,
    'contacto@nazarenohairdressing.com' AS email,
    '+54 9 11 1234-5678' AS telefono,
    TRUE AS activa,
    NOW() AS creada_en
WHERE NOT EXISTS (
    SELECT 1 FROM barberias WHERE slug = 'nazareno-hairdressing'
);

-- ============================================
-- 👤 USUARIO ADMINISTRADOR
-- ============================================
INSERT INTO usuarios (barberia_id, nombre, email, password_hash, rol, activo, creado_en)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    'Administrador' AS nombre,
    'admin@nazarenohairdressing.com' AS email,
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' AS password_hash,
    'ADMIN_BARBERIA' AS rol,
    TRUE AS activo,
    NOW() AS creado_en
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'admin@nazarenohairdressing.com'
);

-- ============================================
-- ✂️ SERVICIOS INICIALES
-- ============================================
INSERT INTO servicios (barberia_id, nombre, duracion_minutos, precio, activo)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    'Corte masculino' AS nombre,
    30 AS duracion_minutos,
    5000.00 AS precio,
    TRUE AS activo
WHERE NOT EXISTS (
    SELECT 1 FROM servicios 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND nombre = 'Corte masculino'
);

INSERT INTO servicios (barberia_id, nombre, duracion_minutos, precio, activo)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    'Corte femenino' AS nombre,
    45 AS duracion_minutos,
    6500.00 AS precio,
    TRUE AS activo
WHERE NOT EXISTS (
    SELECT 1 FROM servicios 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND nombre = 'Corte femenino'
);

INSERT INTO servicios (barberia_id, nombre, duracion_minutos, precio, activo)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    'Corte + barba' AS nombre,
    60 AS duracion_minutos,
    8000.00 AS precio,
    TRUE AS activo
WHERE NOT EXISTS (
    SELECT 1 FROM servicios 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND nombre = 'Corte + barba'
);

-- ============================================
-- 🧴 PRODUCTOS INICIALES
-- ============================================
INSERT INTO productos (barberia_id, nombre, precio, stock_actual, activo)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    'Gel fijador' AS nombre,
    1500.00 AS precio,
    20 AS stock_actual,
    TRUE AS activo
WHERE NOT EXISTS (
    SELECT 1 FROM productos 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND nombre = 'Gel fijador'
);

INSERT INTO productos (barberia_id, nombre, precio, stock_actual, activo)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    'Cera mate' AS nombre,
    1800.00 AS precio,
    15 AS stock_actual,
    TRUE AS activo
WHERE NOT EXISTS (
    SELECT 1 FROM productos 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND nombre = 'Cera mate'
);

-- ============================================
-- 🕐 HORARIOS LABORALES
-- Lunes a Viernes: 09:00 a 18:00
-- Sábado: 09:00 a 14:00
-- Domingo: cerrado (no insertar)
-- ============================================
-- Lunes (1)
INSERT INTO horarios_barberia (barberia_id, dia_semana, hora_inicio, hora_fin)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    1 AS dia_semana,
    '09:00:00' AS hora_inicio,
    '18:00:00' AS hora_fin
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_barberia 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND dia_semana = 1
);

-- Martes (2)
INSERT INTO horarios_barberia (barberia_id, dia_semana, hora_inicio, hora_fin)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    2 AS dia_semana,
    '09:00:00' AS hora_inicio,
    '18:00:00' AS hora_fin
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_barberia 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND dia_semana = 2
);

-- Miércoles (3)
INSERT INTO horarios_barberia (barberia_id, dia_semana, hora_inicio, hora_fin)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    3 AS dia_semana,
    '09:00:00' AS hora_inicio,
    '18:00:00' AS hora_fin
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_barberia 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND dia_semana = 3
);

-- Jueves (4)
INSERT INTO horarios_barberia (barberia_id, dia_semana, hora_inicio, hora_fin)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    4 AS dia_semana,
    '09:00:00' AS hora_inicio,
    '18:00:00' AS hora_fin
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_barberia 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND dia_semana = 4
);

-- Viernes (5)
INSERT INTO horarios_barberia (barberia_id, dia_semana, hora_inicio, hora_fin)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    5 AS dia_semana,
    '09:00:00' AS hora_inicio,
    '18:00:00' AS hora_fin
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_barberia 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND dia_semana = 5
);

-- Sábado (6)
INSERT INTO horarios_barberia (barberia_id, dia_semana, hora_inicio, hora_fin)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    6 AS dia_semana,
    '09:00:00' AS hora_inicio,
    '14:00:00' AS hora_fin
WHERE NOT EXISTS (
    SELECT 1 FROM horarios_barberia 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
    AND dia_semana = 6
);

-- ============================================
-- 🎨 BRANDING INICIAL
-- ============================================
INSERT INTO estilos_barberia (barberia_id, logo_url, color_primario, imagen_portada, texto_bienvenida)
SELECT 
    (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1) AS barberia_id,
    'placeholder' AS logo_url,
    '#111827' AS color_primario,
    'placeholder' AS imagen_portada,
    'Reservá tu turno en Nazareno Hairdressing de forma rápida y sencilla' AS texto_bienvenida
WHERE NOT EXISTS (
    SELECT 1 FROM estilos_barberia 
    WHERE barberia_id = (SELECT id FROM barberias WHERE slug = 'nazareno-hairdressing' LIMIT 1)
);

