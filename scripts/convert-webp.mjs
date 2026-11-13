import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PRODUCTS_IMG_DIR = path.resolve('public/assets/products');
const PRODUCTS_DATA_DIR = path.resolve('src/data/products');
const KEEP_ORIGINAL = process.argv.includes('--keep');
const SUPPORTED_EXTS = new Set(['.png', '.jpg', '.jpeg']);

async function convertFolder() {
  if (!fs.existsSync(PRODUCTS_IMG_DIR)) {
    console.error(`Folder tidak ditemukan: ${PRODUCTS_IMG_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(PRODUCTS_IMG_DIR, { withFileTypes: true });
  const sourceFiles = entries
    .filter((e) => e.isFile() && SUPPORTED_EXTS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();

  if (sourceFiles.length === 0) {
    console.log('Tidak ada file .png/.jpg/.jpeg baru di public/assets/products/.');
  } else {
    console.log(`Mengonversi ${sourceFiles.length} gambar ke format .webp...\n`);
  }

  let convertedCount = 0;
  let totalSavedBytes = 0;

  for (const filename of sourceFiles) {
    const inputPath = path.join(PRODUCTS_IMG_DIR, filename);
    const baseName = filename.slice(0, filename.length - path.extname(filename).length);
    const outputFilename = `${baseName}.webp`;
    const outputPath = path.join(PRODUCTS_IMG_DIR, outputFilename);

    try {
      const inputStat = fs.statSync(inputPath);
      await sharp(inputPath)
        .rotate()
        .webp({ quality: 84, effort: 5 })
        .toFile(outputPath);

      const outputStat = fs.statSync(outputPath);
      if (outputStat.size > 0) {
        convertedCount++;
        const saved = Math.max(0, inputStat.size - outputStat.size);
        totalSavedBytes += saved;
        const beforeKB = (inputStat.size / 1024).toFixed(1);
        const afterKB = (outputStat.size / 1024).toFixed(1);
        console.log(`  [OK] ${filename} (${beforeKB} KB) -> ${outputFilename} (${afterKB} KB)`);

        if (!KEEP_ORIGINAL) {
          fs.unlinkSync(inputPath);
        }
      }
    } catch (err) {
      console.error(`  [GAGAL] ${filename}:`, err instanceof Error ? err.message : err);
    }
  }

  if (convertedCount > 0) {
    const savedMB = (totalSavedBytes / (1024 * 1024)).toFixed(2);
    console.log(
      `\nSelesai: ${convertedCount} gambar dikonversi ke .webp (hemat ${savedMB} MB)${
        KEEP_ORIGINAL ? '' : ' dan file mentah telah dibersihkan'
      }.`
    );
  }

  // Audit kecocokan foto terhadap katalog produk
  if (fs.existsSync(PRODUCTS_DATA_DIR)) {
    const diskAssets = new Set(fs.readdirSync(PRODUCTS_IMG_DIR));
    const diskLowerMap = new Map([...diskAssets].map((f) => [f.toLowerCase(), f]));

    const prodFiles = fs
      .readdirSync(PRODUCTS_DATA_DIR)
      .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== '_template.ts')
      .sort();

    const missingList = [];
    const caseMismatchList = [];

    for (const pf of prodFiles) {
      const content = fs.readFileSync(path.join(PRODUCTS_DATA_DIR, pf), 'utf8');
      const nameMatch = content.match(/"name":\s*"([^"]+)"/) || content.match(/name:\s*'([^']+)'/);
      const prodName = nameMatch ? nameMatch[1] : pf;
      const matches = content.match(/\/assets\/products\/[^'"\s\]]+/g) || [];
      const uniquePaths = [...new Set(matches)];

      for (const assetPath of uniquePaths) {
        const expectedName = assetPath.replace('/assets/products/', '');
        if (!diskAssets.has(expectedName)) {
          const lowerMatch = diskLowerMap.get(expectedName.toLowerCase());
          if (lowerMatch) {
            caseMismatchList.push({ prodName, expectedName, actualName: lowerMatch });
          } else {
            missingList.push({ prodName, expectedName });
          }
        }
      }
    }

    console.log('\n--- CEK KELENGKAPAN FOTO PRODUK ---');
    if (caseMismatchList.length > 0) {
      console.log(`Perbedaan huruf besar/kecil (${caseMismatchList.length}):`);
      for (const item of caseMismatchList) {
        console.log(`  ! [${item.prodName}] di kode: "${item.expectedName}" vs file ada: "${item.actualName}"`);
      }
    }

    if (missingList.length === 0 && caseMismatchList.length === 0) {
      console.log(`SEMUA LENGKAP! Seluruh ${prodFiles.length} produk memiliki file foto yang valid.`);
    } else if (missingList.length > 0) {
      console.log(`Masih ada ${missingList.length} file foto yang belum tersedia di public/assets/products/:`);
      for (const item of missingList) {
        console.log(`  - ${item.expectedName} (${item.prodName})`);
      }
    }
  }
}

convertFolder();
