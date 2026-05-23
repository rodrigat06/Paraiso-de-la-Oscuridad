CREATE DATABASE IF NOT EXISTS bd1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd1;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('USER','ADMIN') DEFAULT 'USER',
  bloqueado BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, apellido, email, password, rol)
VALUES ('Admin', 'moran', 'admin@test.com', '1234', 'ADMIN')
ON DUPLICATE KEY UPDATE password = '1234', rol = 'ADMIN';

CREATE TABLE IF NOT EXISTS ayuda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(30),
  motivo VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  estado ENUM('Nuevo','En revision','Resuelto') DEFAULT 'Nuevo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS resenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  nombre VARCHAR(100) NOT NULL,
  actividad VARCHAR(50) NOT NULL,
  valoracion INT NOT NULL,
  comentario TEXT NOT NULL,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS usuarios_bloqueados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  motivo VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_advertencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  motivo VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  nombre_cliente VARCHAR(100) NOT NULL,
  email_cliente VARCHAR(100) NOT NULL,
  telefono VARCHAR(30),
  actividad VARCHAR(50) NOT NULL,
  instalacion VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  personas INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  estado ENUM('Confirmada','Cancelada') DEFAULT 'Confirmada',
  estado_pago ENUM('Pendiente','Pagado') DEFAULT 'Pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS app_estado (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(120) NOT NULL,
  usuario_email VARCHAR(100) NOT NULL DEFAULT '',
  valor LONGTEXT NOT NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_app_estado (clave, usuario_email)
);

CREATE TABLE IF NOT EXISTS app_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  content_type VARCHAR(120) NOT NULL,
  datos LONGBLOB NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
