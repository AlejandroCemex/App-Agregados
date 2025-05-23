# Configuración de Variables de Entorno

## Paso 1: Crear archivo .env.local

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# URL de tu proyecto de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave anónima (pública) de tu proyecto de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

## Paso 2: Obtener las credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Settings** > **API**
3. Copia la **URL** y la **anon key**
4. Reemplaza los valores en tu archivo `.env.local`

## Paso 3: Verificar la configuración

Reinicia tu servidor de desarrollo:
```bash
npm run dev
```

Si las variables están configuradas correctamente, la aplicación debería funcionar sin errores de autenticación.

## ⚠️ Importante

- **NUNCA** subas el archivo `.env.local` a tu repositorio
- El archivo `.env.local` ya está incluido en `.gitignore`
- Solo las variables que empiezan con `NEXT_PUBLIC_` son visibles en el cliente 