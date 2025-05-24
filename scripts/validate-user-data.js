const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.log('Asegúrate de que existan:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Script de Validación de Datos de Usuario')
console.log('==========================================')

async function validateUserData() {
  try {
    console.log('\n1️⃣ Verificando configuración de Supabase...')
    console.log(`URL: ${supabaseUrl}`)
    console.log(`Key: ${supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADA'}`)

    // 1. Verificar conexión básica probando con tabla Roles
    console.log('\n2️⃣ Probando conexión con Supabase...')
    const { data: testRoles, error: testRolesError } = await supabase
      .from('Roles')
      .select('count')
      .limit(1)

    if (testRolesError) {
      console.log('⚠️  No se pudo conectar con tabla Roles, probando auth...')
      const { data: session } = await supabase.auth.getSession()
      console.log('✅ Conexión con Supabase establecida (auth funciona)')
    } else {
      console.log('✅ Conexión exitosa - tabla Roles accesible')
    }

    // 2. Verificar cada tabla individualmente
    console.log('\n3️⃣ Verificando que las tablas necesarias existen...')
    
    const tablesResults = {}

    // Verificar tabla "Roles de Usuarios"
    try {
      const { data: rolesUsuarios, error: rolesUsuariosError } = await supabase
        .from('Roles de Usuarios')
        .select('*')
        .limit(1)

      if (rolesUsuariosError) {
        console.error('❌ Tabla "Roles de Usuarios":', rolesUsuariosError.message)
        tablesResults.rolesUsuarios = { exists: false, error: rolesUsuariosError.message }
      } else {
        console.log('✅ Tabla "Roles de Usuarios" existe')
        tablesResults.rolesUsuarios = { exists: true, error: null }
      }
    } catch (err) {
      console.error('❌ Error verificando "Roles de Usuarios":', err.message)
      tablesResults.rolesUsuarios = { exists: false, error: err.message }
    }

    // Verificar tabla "Roles"
    try {
      const { data: roles, error: rolesError } = await supabase
        .from('Roles')
        .select('*')
        .limit(1)

      if (rolesError) {
        console.error('❌ Tabla "Roles":', rolesError.message)
        tablesResults.roles = { exists: false, error: rolesError.message }
      } else {
        console.log('✅ Tabla "Roles" existe')
        tablesResults.roles = { exists: true, error: null }
      }
    } catch (err) {
      console.error('❌ Error verificando "Roles":', err.message)
      tablesResults.roles = { exists: false, error: err.message }
    }

    // Verificar tabla "Zonas"
    try {
      const { data: zonas, error: zonasError } = await supabase
        .from('Zonas')
        .select('*')
        .limit(1)

      if (zonasError) {
        console.error('❌ Tabla "Zonas":', zonasError.message)
        tablesResults.zonas = { exists: false, error: zonasError.message }
      } else {
        console.log('✅ Tabla "Zonas" existe')
        tablesResults.zonas = { exists: true, error: null }
      }
    } catch (err) {
      console.error('❌ Error verificando "Zonas":', err.message)
      tablesResults.zonas = { exists: false, error: err.message }
    }

    // 3. Si las tablas existen, obtener sus datos
    console.log('\n4️⃣ Obteniendo datos de las tablas...')

    // Datos de Roles
    if (tablesResults.roles?.exists) {
      const { data: allRoles, error: allRolesError } = await supabase
        .from('Roles')
        .select('*')

      if (!allRolesError && allRoles) {
        console.log(`✅ Tabla "Roles" tiene ${allRoles.length} registros:`)
        allRoles.forEach(role => {
          console.log(`   - ID: ${role.id}, Nombre: ${role.nombre}`)
        })
      } else {
        console.log('❌ No se pudieron obtener los datos de roles')
      }
    }

    // Datos de Zonas
    if (tablesResults.zonas?.exists) {
      const { data: allZonas, error: allZonasError } = await supabase
        .from('Zonas')
        .select('*')

      if (!allZonasError && allZonas) {
        console.log(`✅ Tabla "Zonas" tiene ${allZonas.length} registros:`)
        allZonas.forEach(zona => {
          console.log(`   - ID: ${zona.id}, Nombre: ${zona.nombre}`)
        })
      } else {
        console.log('❌ No se pudieron obtener los datos de zonas')
      }
    }

    // Datos de Roles de Usuarios
    if (tablesResults.rolesUsuarios?.exists) {
      const { data: allRolesUsuarios, error: allRolesUsuariosError } = await supabase
        .from('Roles de Usuarios')
        .select('*')

      if (!allRolesUsuariosError && allRolesUsuarios) {
        console.log(`✅ Tabla "Roles de Usuarios" tiene ${allRolesUsuarios.length} registros:`)
        if (allRolesUsuarios.length === 0) {
          console.log('   ⚠️  ¡TABLA VACÍA! No hay usuarios con roles asignados')
        } else {
          allRolesUsuarios.forEach(user => {
            console.log(`   - Usuario: ${user.email || user.id}`)
            console.log(`     Nombre: ${user.nombre || 'No definido'}`)
            console.log(`     ID Rol: ${user.id_rol || 'No asignado'}`)
            console.log(`     ID Zona: ${user.id_zona || 'No asignado'}`)
            console.log('     ---')
          })
        }
      } else {
        console.log('❌ No se pudieron obtener los usuarios con roles')
      }
    }

    // 4. Probar la consulta completa con JOINs (solo si todas las tablas existen)
    if (tablesResults.rolesUsuarios?.exists && tablesResults.roles?.exists && tablesResults.zonas?.exists) {
      console.log('\n5️⃣ Probando consulta completa con relaciones...')
      
      const { data: fullUserData, error: fullUserError } = await supabase
        .from('Roles de Usuarios')
        .select(`
          *,
          Roles!id_rol(id, nombre),
          Zonas!id_zona(id, nombre)
        `)

      if (!fullUserError && fullUserData) {
        console.log('✅ Consulta con relaciones exitosa:')
        if (fullUserData.length === 0) {
          console.log('   ⚠️  No hay usuarios para mostrar')
        } else {
          fullUserData.forEach(user => {
            console.log(`   👤 Usuario: ${user.email || user.id}`)
            console.log(`      Nombre: ${user.nombre || 'No definido'}`)
            console.log(`      Rol: ${user.Roles?.nombre || 'No asignado'}`)
            console.log(`      Zona: ${user.Zonas?.nombre || 'No asignada'}`)
            console.log('      ---')
          })
        }
      } else {
        console.error('❌ Error en consulta con relaciones:', fullUserError?.message)
      }
    } else {
      console.log('\n5️⃣ ⚠️  Saltando consulta con relaciones - faltan tablas')
    }

    // 5. Resumen final
    console.log('\n✅ Validación completada')
    console.log('\n📋 RESUMEN:')
    console.log(`- Tabla "Roles de Usuarios": ${tablesResults.rolesUsuarios?.exists ? '✅' : '❌'}`)
    console.log(`- Tabla "Roles": ${tablesResults.roles?.exists ? '✅' : '❌'}`)
    console.log(`- Tabla "Zonas": ${tablesResults.zonas?.exists ? '✅' : '❌'}`)

    // Diagnóstico crítico
    if (!tablesResults.rolesUsuarios?.exists) {
      console.log('\n🚨 PROBLEMA CRÍTICO:')
      console.log('   La tabla "Roles de Usuarios" no existe o no es accesible')
      console.log('   Esto significa que NINGÚN usuario tendrá permisos o roles')
      console.log('   SOLUCIÓN: Crear la tabla en Supabase con la estructura correcta')
    } else {
      console.log('\n✅ Las tablas principales existen')
      console.log('   El sistema debería funcionar correctamente')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Ejecutar validación
validateUserData() 