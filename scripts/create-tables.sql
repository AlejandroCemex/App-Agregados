-- Script para crear las tablas necesarias en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear tabla Roles
CREATE TABLE IF NOT EXISTS "Roles" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla Zonas
CREATE TABLE IF NOT EXISTS "Zonas" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla Roles de Usuarios
CREATE TABLE IF NOT EXISTS "Roles de Usuarios" (
    id UUID PRIMARY KEY,  -- Debe coincidir con el UUID de auth.users
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    id_rol INTEGER REFERENCES "Roles"(id),
    id_zona INTEGER REFERENCES "Zonas"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user_auth FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Insertar roles por defecto
INSERT INTO "Roles" (nombre, descripcion) VALUES 
    ('Admin', 'Administrador del sistema'),
    ('Supervisor', 'Supervisor de zona'),
    ('Operador', 'Operador básico'),
    ('Consulta', 'Solo consulta')
ON CONFLICT (nombre) DO NOTHING;

-- 5. Insertar zonas por defecto
INSERT INTO "Zonas" (nombre, descripcion) VALUES 
    ('Zona Norte', 'Zona metropolitana norte'),
    ('Zona Sur', 'Zona metropolitana sur'),
    ('Zona Centro', 'Zona centro de la ciudad'),
    ('Zona Este', 'Zona oriental'),
    ('Zona Oeste', 'Zona occidental')
ON CONFLICT (nombre) DO NOTHING;

-- 6. Habilitar RLS (Row Level Security) 
ALTER TABLE "Roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Zonas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Roles de Usuarios" ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de seguridad básicas

-- Política para tabla Roles (lectura para todos los usuarios autenticados)
CREATE POLICY "Allow read access to roles" ON "Roles"
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política para tabla Zonas (lectura para todos los usuarios autenticados)
CREATE POLICY "Allow read access to zonas" ON "Zonas"
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política para tabla Roles de Usuarios (los usuarios solo pueden ver su propio registro)
CREATE POLICY "Users can view their own role" ON "Roles de Usuarios"
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para que los admins puedan ver todos los registros
CREATE POLICY "Admins can view all user roles" ON "Roles de Usuarios"
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM "Roles de Usuarios" ru 
            JOIN "Roles" r ON ru.id_rol = r.id 
            WHERE ru.id = auth.uid() AND r.nombre = 'Admin'
        )
    );

-- 8. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Crear triggers para actualizar updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON "Roles" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zonas_updated_at BEFORE UPDATE ON "Zonas" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON "Roles de Usuarios" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON "Roles de Usuarios"(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_rol ON "Roles de Usuarios"(id_rol);
CREATE INDEX IF NOT EXISTS idx_user_roles_zona ON "Roles de Usuarios"(id_zona);

-- Ejemplo de cómo insertar un usuario con rol
-- (Ejecutar después de que un usuario se registre en auth)
/*
INSERT INTO "Roles de Usuarios" (id, email, nombre, id_rol, id_zona)
VALUES (
    'UUID_DEL_USUARIO_DE_AUTH',  -- UUID del usuario de auth.users
    'usuario@ejemplo.com',        -- Email del usuario
    'Nombre del Usuario',         -- Nombre completo
    1,                           -- ID del rol (1 = Admin, 2 = Supervisor, etc.)
    1                            -- ID de la zona (1 = Zona Norte, etc.)
);
*/ 