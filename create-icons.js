const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Đảm bảo thư mục favicon tồn tại
const faviconDir = path.join(__dirname, 'public', 'favicon');
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
}

// Tạo icon SVG đơn giản cho ứng dụng quản lý cơ sở vật chất
const createSVGIcon = (size) => {
  const padding = size * 0.1;
  const innerSize = size - (padding * 2);
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1565c0;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background circle -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad1)" stroke="#ffffff" stroke-width="2"/>
      
      <!-- Building icon -->
      <g transform="translate(${padding}, ${padding})" fill="white">
        <!-- Main building -->
        <rect x="${innerSize * 0.2}" y="${innerSize * 0.4}" width="${innerSize * 0.6}" height="${innerSize * 0.5}" rx="2"/>
        
        <!-- Windows -->
        <rect x="${innerSize * 0.3}" y="${innerSize * 0.5}" width="${innerSize * 0.15}" height="${innerSize * 0.2}" rx="1"/>
        <rect x="${innerSize * 0.55}" y="${innerSize * 0.5}" width="${innerSize * 0.15}" height="${innerSize * 0.2}" rx="1"/>
        
        <!-- Door -->
        <rect x="${innerSize * 0.42}" y="${innerSize * 0.7}" width="${innerSize * 0.16}" height="${innerSize * 0.2}" rx="1"/>
        
        <!-- Roof -->
        <polygon points="${innerSize * 0.15},${innerSize * 0.4} ${innerSize * 0.5},${innerSize * 0.25} ${innerSize * 0.85},${innerSize * 0.4}" fill="white"/>
        
        <!-- Equipment icon -->
        <circle cx="${innerSize * 0.25}" cy="${innerSize * 0.25}" r="${innerSize * 0.08}" fill="white"/>
        <circle cx="${innerSize * 0.75}" cy="${innerSize * 0.25}" r="${innerSize * 0.08}" fill="white"/>
      </g>
    </svg>
  `;
};

// Các kích thước icon cần tạo
const iconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon-57x57.png', size: 57 },
  { name: 'apple-touch-icon-60x60.png', size: 60 },
  { name: 'apple-touch-icon-72x72.png', size: 72 },
  { name: 'apple-touch-icon-76x76.png', size: 76 },
  { name: 'apple-touch-icon-114x114.png', size: 114 },
  { name: 'apple-touch-icon-120x120.png', size: 120 },
  { name: 'apple-touch-icon-144x144.png', size: 144 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'mstile-150x150.png', size: 150 }
];

// Tạo favicon.ico (16x16, 32x32, 48x48)
const createFaviconICO = async () => {
  const sizes = [16, 32, 48];
  const pngBuffers = [];
  
  for (const size of sizes) {
    const svg = createSVGIcon(size);
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
    pngBuffers.push({ size, buffer: pngBuffer });
  }
  
  // Tạo ICO file (đơn giản hóa - chỉ lưu PNG 32x32)
  fs.writeFileSync(path.join(faviconDir, 'favicon.ico'), pngBuffers[1].buffer);
  console.log('✅ Tạo favicon.ico thành công');
};

// Tạo tất cả các icon
const createAllIcons = async () => {
  console.log('🎨 Bắt đầu tạo các icon PWA...');
  
  for (const icon of iconSizes) {
    try {
      const svg = createSVGIcon(icon.size);
      const outputPath = path.join(faviconDir, icon.name);
      
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Tạo ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Lỗi khi tạo ${icon.name}:`, error);
    }
  }
  
  await createFaviconICO();
  
  console.log('🎉 Hoàn thành tạo tất cả icon!');
  console.log('📁 Các icon đã được lưu trong thư mục: public/favicon/');
};

// Chạy script
createAllIcons().catch(console.error); 