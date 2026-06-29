-- ============================================
-- Script de creación de base de datos
-- Sistema de Turnos para Barberías
-- MySQL 8.0+
-- ============================================

-- Crear base de datos (descomentar si es necesario)
CREATE DATABASE IF NOT EXISTS turnero CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE turnero;

-- ============================================
-- 🏪 TABLA: barberias
-- Representa cada barbería (tenant)
-- ============================================
CREATE TABLE IF NOT EXISTS barberias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    activa BOOLEAN DEFAULT TRUE,
    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 👤 TABLA: usuarios
-- Usuarios internos del sistema
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('SUPER_ADMIN', 'ADMIN_BARBERIA', 'BARBERO') NOT NULL DEFAULT 'BARBERO',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE SET NULL,
    INDEX idx_barberia (barberia_id),
    INDEX idx_email (email),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🧑 TABLA: clientes
-- Clientes finales que reservan turnos
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    INDEX idx_barberia (barberia_id),
    INDEX idx_email (email),
    INDEX idx_telefono (telefono),
    UNIQUE KEY uk_barberia_email (barberia_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ✂️ TABLA: servicios
-- Servicios ofrecidos por la barbería
-- ============================================
CREATE TABLE IF NOT EXISTS servicios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    duracion_minutos INT UNSIGNED NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    INDEX idx_barberia (barberia_id),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🧴 TABLA: productos
-- Productos adicionales (gel, cera, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock_actual INT UNSIGNED DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    INDEX idx_barberia (barberia_id),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 📅 TABLA: turnos
-- Turnos reservados por clientes
-- ============================================
CREATE TABLE IF NOT EXISTS turnos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    cliente_id INT UNSIGNED NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    estado ENUM('PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'NO_ASISTIO') NOT NULL DEFAULT 'PENDIENTE',
    precio_total DECIMAL(10, 2) DEFAULT 0.00,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    INDEX idx_barberia (barberia_id),
    INDEX idx_cliente (cliente_id),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🔗 TABLA: turno_servicios
-- Relación turno – servicios
-- ============================================
CREATE TABLE IF NOT EXISTS turno_servicios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    turno_id INT UNSIGNED NOT NULL,
    servicio_id INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE,
    INDEX idx_turno (turno_id),
    INDEX idx_servicio (servicio_id),
    UNIQUE KEY uk_turno_servicio (turno_id, servicio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🔗 TABLA: turno_productos
-- Relación turno – productos
-- ============================================
CREATE TABLE IF NOT EXISTS turno_productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    turno_id INT UNSIGNED NOT NULL,
    producto_id INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    INDEX idx_turno (turno_id),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 💳 TABLA: pagos
-- Pagos asociados a turnos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    turno_id INT UNSIGNED,
    monto DECIMAL(10, 2) NOT NULL,
    estado ENUM('PAGADO', 'FALLIDO', 'DEVUELTO') NOT NULL DEFAULT 'PAGADO',
    proveedor ENUM('MERCADO_PAGO') NOT NULL DEFAULT 'MERCADO_PAGO',
    referencia_externa VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE SET NULL,
    INDEX idx_barberia (barberia_id),
    INDEX idx_turno (turno_id),
    INDEX idx_estado (estado),
    INDEX idx_referencia_externa (referencia_externa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🎁 TABLA: membresias
-- Sistema de fidelización
-- ============================================
CREATE TABLE IF NOT EXISTS membresias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    cliente_id INT UNSIGNED NOT NULL,
    puntos_acumulados INT UNSIGNED DEFAULT 0,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    UNIQUE KEY uk_barberia_cliente (barberia_id, cliente_id),
    INDEX idx_barberia (barberia_id),
    INDEX idx_cliente (cliente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🎨 TABLA: estilos_barberia
-- Branding del front público
-- ============================================
CREATE TABLE IF NOT EXISTS estilos_barberia (
    barberia_id INT UNSIGNED PRIMARY KEY,
    logo_url VARCHAR(500),
    color_primario VARCHAR(7),
    imagen_portada VARCHAR(500),
    texto_bienvenida TEXT,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🕵️ TABLA: auditoria
-- Registro de acciones importantes
-- ============================================
CREATE TABLE IF NOT EXISTS auditoria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED,
    usuario_id INT UNSIGNED,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    entidad_id INT UNSIGNED,
    datos_previos JSON,
    datos_nuevos JSON,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_barberia (barberia_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_entidad (entidad, entidad_id),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🕐 TABLA: horarios_barberia
-- Gestión de horarios laborales por barbería
-- ============================================
CREATE TABLE IF NOT EXISTS horarios_barberia (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    dia_semana TINYINT UNSIGNED NOT NULL COMMENT '0 = domingo, 6 = sábado',
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    UNIQUE KEY uk_barberia_dia (barberia_id, dia_semana),
    INDEX idx_barberia (barberia_id),
    INDEX idx_dia_semana (dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 🚫 TABLA: bloqueos_horarios
-- Bloqueos manuales de agenda (vacaciones, feriados, cierres)
-- ============================================
CREATE TABLE IF NOT EXISTS bloqueos_horarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    barberia_id INT UNSIGNED NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    motivo VARCHAR(255),
    FOREIGN KEY (barberia_id) REFERENCES barberias(id) ON DELETE CASCADE,
    INDEX idx_barberia (barberia_id),
    INDEX idx_fecha_inicio (fecha_inicio),
    INDEX idx_fecha_fin (fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

