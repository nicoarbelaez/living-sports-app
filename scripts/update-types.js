const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script para generar tipos de Supabase de forma cross-platform.
 * Lee PROJECT_REF de .env.local si no está definido en el ambiente.
 */

let projectRef = process.env.PROJECT_REF;

if (!projectRef) {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/PROJECT_REF=(.*)/);
      if (match) projectRef = match[1].trim();
    }
  } catch (e) {
    console.warn('Aviso: No se pudo leer .env.local');
  }
}

if (!projectRef) {
  console.error('Error: PROJECT_REF no encontrado. Asegúrate de tenerlo en .env.local o en tu ambiente.');
  process.exit(1);
}

// Eliminar posibles comillas del valor
projectRef = projectRef.replace(/['"]/g, '');

console.log(`🚀 Generando tipos de Supabase para el proyecto: ${projectRef}...`);

try {
  // Ejecutar el comando de la CLI de Supabase
  // Usamos el comando nativo para mayor compatibilidad
  execSync(`npx supabase gen types typescript --project-id ${projectRef} --schema public > database.types.ts`, { 
    stdio: 'inherit',
    shell: true 
  });
  console.log('✅ ¡Tipos generados exitosamente en database.types.ts!');
} catch (error) {
  console.error('❌ Error al generar los tipos:', error.message);
  process.exit(1);
}
