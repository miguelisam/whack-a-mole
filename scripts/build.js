/**
 * Build Script - Whack-a-Mole
 * 
 * Copia los archivos necesarios al directorio dist/ para producción.
 * Se ejecuta con: npm run build
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = 'dist';
const FILES_TO_COPY = [
    'index.html',
    'style.css',
    'game.js',
    'hammer.svg',
    'hammer-hit.svg'
];

console.log('🏗️  Building Whack-a-Mole for production...\n');

// Crear directorio dist si no existe
if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
    console.log(`📁 Created ${DIST_DIR}/ directory`);
}

// Copiar archivos
let copiedCount = 0;
let errorCount = 0;

FILES_TO_COPY.forEach(file => {
    const src = path.join(__dirname, '..', file);
    const dest = path.join(__dirname, '..', DIST_DIR, file);
    
    try {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✅ Copied: ${file}`);
            copiedCount++;
        } else {
            console.log(`⚠️  Warning: ${file} not found, skipping`);
        }
    } catch (error) {
        console.error(`❌ Error copying ${file}:`, error.message);
        errorCount++;
    }
});

console.log('\n📊 Build Summary:');
console.log(`   ✅ Files copied: ${copiedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);

if (errorCount > 0) {
    console.log('\n❌ Build completed with errors');
    process.exit(1);
} else {
    console.log('\n✅ Build completed successfully!');
    console.log(`📦 Output: ${DIST_DIR}/`);
}
