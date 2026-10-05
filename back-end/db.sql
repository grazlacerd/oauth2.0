CREATE DATABASE system_auth;

USE system_auth;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role ENUM('admin', 'usuario') NOT NULL DEFAULT "usuario",
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

ALTER TABLE usuarios MODIFY senha VARCHAR(255) NULL;

ALTER TABLE usuarios
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE,
ADD COLUMN provedor ENUM('local', 'google') NOT NULL DEFAULT 'local' AFTER google_id,
ADD COLUMN foto VARCHAR(255) NULL AFTER provedor;

CREATE TABLE enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    CONSTRAINT fk_enderecos_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);
 

SELECT * FROM usuarios;

CREATE DATABASE IF NOT EXISTS system_auth_2;
 
USE system_auth;
 
 
DROP TABLE endereco;
-- ---------------------------------------------------------
CREATE TABLE usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NULL,
    role ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
    google_id VARCHAR(255) NULL UNIQUE,
    provedor ENUM('local', 'google') NOT NULL DEFAULT 'local',
    foto VARCHAR(500) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
 
CREATE TABLE enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    CONSTRAINT fk_enderecos_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);
 
SELECT * FROM usuarios;
 
-- Usuário + endereço juntos (LEFT JOIN traz também quem não tem endereço)
SELECT u.id, u.nome, u.email, u.provedor, e.cep, e.logradouro, e.numero, e.cidade, e.uf
FROM usuarios u
LEFT JOIN enderecos e ON e.usuario_id = u.id;
 