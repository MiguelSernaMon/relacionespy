const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'assets', 'icon.svg');
const outputDir = path.join(__dirname, 'assets');

// Asegurar que el directorio existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar PNG de 512x512 (para electron-builder)
sharp(svgPath)
  .resize(512, 512)
  .png()
  .toFile(path.join(outputDir, 'icon.png'))
  .then(() => console.log('✅ icon.png generado (512x512)'))
  .catch(err => console.error('❌ Error generando icon.png:', err));

// Generar PNG de 256x256 (alternativo)
sharp(svgPath)
  .resize(256, 256)
  .png()
  .toFile(path.join(outputDir, 'icon-256.png'))
  .then(() => console.log('✅ icon-256.png generado (256x256)'))
  .catch(err => console.error('❌ Error generando icon-256.png:', err));

// Generar ICO para Windows (usando PNG base)
sharp(svgPath)
  .resize(256, 256)
  .png()
  .toFile(path.join(outputDir, 'icon-temp.png'))
  .then(() => {
    console.log('✅ Imagen temporal generada para ICO');
    console.log('ℹ️  Para Windows, electron-builder convertirá icon.png a .ico automáticamente');
  })
  .catch(err => console.error('❌ Error:', err));
