const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// Create required folders
const dirs = [
  'assets/fonts',
  'assets/images',
  'assets/css',
  'assets/js',
  'assets/webfonts'
];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Helper to download a file
function download(url, dest) {
  return new Promise((resolve, reject) => {
    // console.log(`Downloading: ${url} -> ${dest}`);
    const file = fs.createWriteStream(dest);
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    https.get(url, { headers }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Download Google Fonts helper
async function downloadGoogleFonts() {
  console.log('--- Downloading Google Fonts ---');
  const googleFontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;700;800&display=swap';
  const tempCssPath = 'assets/fonts/google-fonts-temp.css';
  await download(googleFontUrl, tempCssPath);
  
  let cssContent = fs.readFileSync(tempCssPath, 'utf8');
  
  // Extract and download font files
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  let match;
  const fontUrls = [];
  
  while ((match = urlRegex.exec(cssContent)) !== null) {
    fontUrls.push(match[1]);
  }
  
  // Unique font urls
  const uniqueUrls = [...new Set(fontUrls)];
  console.log(`Found ${uniqueUrls.length} unique font files. Downloading...`);
  
  for (let i = 0; i < uniqueUrls.length; i++) {
    const fontUrl = uniqueUrls[i];
    const filename = path.basename(fontUrl);
    const localPath = `assets/fonts/${filename}`;
    await download(fontUrl, localPath);
    console.log(`Downloaded font file: ${filename}`);
    
    // Replace remote URL with local path in CSS
    cssContent = cssContent.replaceAll(fontUrl, `./${filename}`);
  }
  
  // Add font-display: swap to every font-face rule if not present
  cssContent = cssContent.replace(/font-style:\s*normal;/g, 'font-style: normal; font-display: swap;');
  
  // Write the localized CSS file
  fs.writeFileSync('assets/fonts/fonts.css', cssContent);
  fs.unlinkSync(tempCssPath);
  console.log('Fonts localized successfully into assets/fonts/fonts.css');
}

// Download external CDNs (CSS & JS)
async function downloadLibraries() {
  console.log('--- Downloading Vendor Libraries ---');
  
  // Bootstrap CSS
  await download('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', 'assets/css/bootstrap.min.css');
  console.log('Downloaded Bootstrap CSS');

  // Bootstrap JS
  await download('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', 'assets/js/bootstrap.bundle.min.js');
  console.log('Downloaded Bootstrap JS');

  // Lenis JS
  await download('https://cdn.jsdelivr.net/npm/lenis@1.3.24/dist/lenis.min.js', 'assets/js/lenis.min.js');
  console.log('Downloaded Lenis JS');

  // Font Awesome CSS
  const faCssUrl = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  const tempFaCss = 'assets/css/all-temp.css';
  await download(faCssUrl, tempFaCss);
  
  let faCssContent = fs.readFileSync(tempFaCss, 'utf8');
  
  // Find webfont references, download them and map locally
  const fontRegex = /url\(([^)]+)\)/g;
  let match;
  const webfonts = [];
  while ((match = fontRegex.exec(faCssContent)) !== null) {
    const fontRef = match[1].split('?')[0]; // strip query strings
    if (fontRef.includes('../webfonts/')) {
      webfonts.push(fontRef);
    }
  }
  
  const uniqueWebfonts = [...new Set(webfonts)];
  console.log(`Found ${uniqueWebfonts.length} Font Awesome webfonts. Downloading...`);
  
  for (const fontRef of uniqueWebfonts) {
    const basename = fontRef.replace('../webfonts/', '');
    const remoteUrl = `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/${basename}`;
    const localPath = `assets/webfonts/${basename}`;
    try {
      await download(remoteUrl, localPath);
      console.log(`Downloaded webfont: ${basename}`);
      // Replace reference in CSS to point to local webfonts directory
      faCssContent = faCssContent.replaceAll(fontRef, `../webfonts/${basename}`);
    } catch (e) {
      console.error(`Error downloading webfont ${basename}:`, e.message);
    }
  }
  
  fs.writeFileSync('assets/css/all.min.css', faCssContent);
  fs.unlinkSync(tempFaCss);
  console.log('Font Awesome CSS localized successfully into assets/css/all.min.css');
}

// Compress and convert images
async function processImages() {
  console.log('--- Processing Images ---');
  
  const images = [
    {
      name: 'hero',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
      widths: [640, 1024, 1470],
      isHero: true
    },
    {
      name: 'trainer-alex',
      url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=500&auto=format&fit=crop',
      widths: [400],
      isHero: false
    },
    {
      name: 'trainer-sarah',
      url: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=500&auto=format&fit=crop',
      widths: [400],
      isHero: false
    },
    {
      name: 'trainer-marcus',
      url: 'https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=500&auto=format&fit=crop',
      widths: [400],
      isHero: false
    },
    {
      name: 'testimonial-david',
      url: 'https://randomuser.me/api/portraits/men/32.jpg',
      widths: [80],
      isHero: false
    },
    {
      name: 'testimonial-emma',
      url: 'https://randomuser.me/api/portraits/women/44.jpg',
      widths: [80],
      isHero: false
    },
    {
      name: 'testimonial-james',
      url: 'https://randomuser.me/api/portraits/men/85.jpg',
      widths: [80],
      isHero: false
    },
    {
      name: 'transform-before',
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
      widths: [800],
      isHero: false
    },
    {
      name: 'transform-after',
      url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
      widths: [800],
      isHero: false
    },
    {
      name: 'gallery-interior',
      url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=800&auto=format&fit=crop',
      widths: [800],
      isHero: false
    },
    {
      name: 'gallery-weights',
      url: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop',
      widths: [400],
      isHero: false
    },
    {
      name: 'gallery-training',
      url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop',
      widths: [400],
      isHero: false
    },
    {
      name: 'gallery-cardio',
      url: 'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?q=80&w=800&auto=format&fit=crop',
      widths: [800],
      isHero: false
    }
  ];

  for (const img of images) {
    const tempPath = `assets/images/${img.name}-temp`;
    console.log(`Fetching remote image for: ${img.name}...`);
    try {
      await download(img.url, tempPath);
      
      for (const w of img.widths) {
        const suffix = img.widths.length > 1 ? `-${w}` : '';
        const webpPath = `assets/images/${img.name}${suffix}.webp`;
        
        // Convert to WebP
        await sharp(tempPath)
          .resize(w)
          .webp({ quality: 80 })
          .toFile(webpPath);
        console.log(`Generated WebP: ${webpPath}`);

        // If it's above-the-fold hero image, also generate AVIF for maximum LCP optimization
        if (img.isHero) {
          const avifPath = `assets/images/${img.name}${suffix}.avif`;
          await sharp(tempPath)
            .resize(w)
            .avif({ quality: 75 })
            .toFile(avifPath);
          console.log(`Generated AVIF: ${avifPath}`);
        }
      }
      
      fs.unlinkSync(tempPath);
    } catch (e) {
      console.error(`Error processing image ${img.name}:`, e.message);
    }
  }
}

async function main() {
  try {
    await downloadGoogleFonts();
    await downloadLibraries();
    await processImages();
    console.log('=== All assets processed successfully ===');
  } catch (err) {
    console.error('Critical error in asset download script:', err);
    process.exit(1);
  }
}

main();
