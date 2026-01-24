/**
 * Script to convert existing HEIC files to JPEG
 * Run with: node scripts/convert-existing-heic.js
 */

const fs = require('fs/promises');
const path = require('path');
const convert = require('heic-convert');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const ENTRIES_DIR = path.join(__dirname, '..', 'data', 'entries');

async function convertHeicFile(filePath) {
  try {
    console.log(`Converting: ${path.basename(filePath)}`);

    // Read the HEIC file
    const inputBuffer = await fs.readFile(filePath);

    // Convert to JPEG
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9,
    });

    // Generate new filename (replace .HEIC/.heic with .jpg)
    const newFilePath = filePath.replace(/\.(heic|HEIC|heif|HEIF)$/, '.jpg');

    // Save converted file
    await fs.writeFile(newFilePath, Buffer.from(outputBuffer));

    console.log(`✓ Converted to: ${path.basename(newFilePath)}`);

    return {
      oldPath: filePath,
      newPath: newFilePath,
      oldUrl: `/uploads/${path.basename(filePath)}`,
      newUrl: `/uploads/${path.basename(newFilePath)}`,
    };
  } catch (error) {
    console.error(`✗ Failed to convert ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

async function updateEntriesJson(conversions) {
  console.log('\nUpdating entry JSON files...');

  try {
    const files = await fs.readdir(ENTRIES_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = path.join(ENTRIES_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      let entry = JSON.parse(content);
      let modified = false;

      // Update photo URLs in the entry
      entry.photos = entry.photos.map(photo => {
        const conversion = conversions.find(c => c && c.oldUrl === photo.url);
        if (conversion) {
          console.log(`  Updated ${file}: ${conversion.oldUrl} → ${conversion.newUrl}`);
          modified = true;
          return { ...photo, url: conversion.newUrl };
        }
        return photo;
      });

      // Save if modified
      if (modified) {
        await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf-8');
      }
    }

    console.log('✓ Entry files updated');
  } catch (error) {
    console.error('Error updating entries:', error.message);
  }
}

async function deleteOldHeicFiles(conversions) {
  console.log('\nDeleting original HEIC files...');

  for (const conversion of conversions) {
    if (conversion) {
      try {
        await fs.unlink(conversion.oldPath);
        console.log(`✓ Deleted: ${path.basename(conversion.oldPath)}`);
      } catch (error) {
        console.error(`✗ Failed to delete ${path.basename(conversion.oldPath)}:`, error.message);
      }
    }
  }
}

async function main() {
  console.log('🔄 Converting existing HEIC files to JPEG...\n');

  try {
    // Find all HEIC files
    const files = await fs.readdir(UPLOADS_DIR);
    const heicFiles = files.filter(f => /\.(heic|HEIC|heif|HEIF)$/.test(f));

    if (heicFiles.length === 0) {
      console.log('No HEIC files found. All done! ✓');
      return;
    }

    console.log(`Found ${heicFiles.length} HEIC file(s)\n`);

    // Convert each file
    const conversions = [];
    for (const file of heicFiles) {
      const filePath = path.join(UPLOADS_DIR, file);
      const result = await convertHeicFile(filePath);
      conversions.push(result);
    }

    const successful = conversions.filter(c => c !== null).length;
    console.log(`\n✓ Successfully converted ${successful}/${heicFiles.length} files`);

    // Update entry JSON files
    await updateEntriesJson(conversions);

    // Ask to delete old files
    console.log('\n⚠️  Original HEIC files can now be safely deleted.');
    console.log('Run this script with the --delete flag to remove them:');
    console.log('  node scripts/convert-existing-heic.js --delete\n');

    if (process.argv.includes('--delete')) {
      await deleteOldHeicFiles(conversions);
      console.log('\n✓ Cleanup complete!');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
