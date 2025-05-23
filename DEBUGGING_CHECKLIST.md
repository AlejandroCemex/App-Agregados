# 🔍 Lista de Verificación para Debugging

## 1. ✅ Variables de Entorno

### Verificar que `.env.local` existe y tiene:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

### Verificar en Supabase Dashboard:
1. Ve a **Settings** → **API**
2. Copia **URL** y **anon key**
3. Pega en `.env.local`

## 2. ✅ Verificar Tabla de Roles

### En Supabase SQL Editor, ejecuta:
```sql
-- Verificar nombres exactos de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%role%' OR table_name LIKE '%usuario%');

-- Si la tabla se llama diferente, verificar estructura
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Roles de Usuarios' -- o el nombre real
AND table_schema = 'public';
```

## 3. ✅ Testing Paso a Paso

### En la consola del navegador (F12), verifica:

1. **Variables de entorno cargadas:**
```javascript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

2. **Conexión a Supabase:**
```javascript
// En la página de login, abre la consola y verifica que aparezcan estos logs:
// - "useAuth: Starting sign in process"
// - "Attempting to sign in with email: tu-email"
// - "Sign in successful" O el error específico
```

## 4. ✅ Errores Comunes y Soluciones

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- **Solución:** Crear `.env.local` con las variables correctas
- **Verificar:** El archivo debe estar en la raíz del proyecto

### Error: "Invalid login credentials"
- **Solución:** Verificar que el usuario existe en Supabase Auth
- **Verificar:** En Supabase Dashboard → Authentication → Users

### Error: "relation 'Roles de Usuarios' does not exist"
- **Solución:** Verificar nombre exacto de la tabla en Supabase
- **Alternativa:** Cambiar nombre en `lib/services/auth.ts` línea 30

### Error: "Email not confirmed"
- **Solución:** En Supabase Dashboard → Authentication → Settings
- **Verificar:** Desactivar "Enable email confirmations" para testing

## 5. ✅ Testing de Autenticación

### Crear usuario de prueba:
1. Ve a Supabase Dashboard → Authentication → Users
2. Click "Invite User" o "Create User"
3. Usa email y contraseña simples para testing

### Verificar logs en tiempo real:
1. Abre la consola del navegador (F12)
2. Ve a la página de login
3. Intenta hacer login
4. Observa los logs detallados

## 6. ✅ Verificación Final

### Si todo funciona, deberías ver:
```
✅ useAuth: Starting sign in process
✅ Attempting to sign in with email: test@example.com
✅ Sign in successful
✅ useAuth: Sign in successful, refreshing user data
✅ Fetching current user with role...
✅ User fetched: test@example.com Role: [nombre del rol o null]
✅ Auth state change: SIGNED_IN test@example.com
```

### Redirección automática:
- Usuario autenticado → `/dashboard`
- Usuario no autenticado en ruta protegida → `/login`

---

## 🆘 Si Aún No Funciona

1. **Reiniciar servidor:** `npm run dev`
2. **Limpiar caché:** Ctrl+Shift+R en el navegador
3. **Verificar Network tab:** Buscar errores 401/403
4. **Compartir logs específicos** de la consola del navegador 