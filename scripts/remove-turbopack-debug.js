#!/usr/bin/env node

/**
 * Post-build script to remove TURBOPACK_OUTPUT_D debug markers from build output
 * These debug statements pollute stdout/stderr and should not be in production builds
 */

const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.join(__dirname, '..', '.next', 'build');

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.map')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function removeTurbopackDebugMarkers() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log('Build directory not found, skipping debug marker removal');
    return;
  }

  try {
    const files = findJsFiles(BUILD_DIR);
    let totalRemoved = 0;

    for (const file of files) {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;

      // Remove the debug marker lines
      // Pattern: process.stderr.write(`TURBOPACK_OUTPUT_D\n`); and process.stdout.write(`TURBOPACK_OUTPUT_D\n`);
      // Handle both with and without leading whitespace, and with/without trailing newline
      content = content.replace(/\s*process\.(stderr|stdout)\.write\(`TURBOPACK_OUTPUT_D\\n`\);\s*\n?/g, '');

      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        const removed = (originalContent.match(/TURBOPACK_OUTPUT_D/g) || []).length;
        totalRemoved += removed;
        console.log(`Removed ${removed} debug marker(s) from ${path.relative(BUILD_DIR, file)}`);
      }
    }

    if (totalRemoved > 0) {
      console.log(`\n✓ Removed ${totalRemoved} TURBOPACK_OUTPUT_D debug marker(s) from build output`);
    } else {
      console.log('No TURBOPACK_OUTPUT_D debug markers found in build output');
    }
  } catch (error) {
    console.error('Error removing Turbopack debug markers:', error);
    process.exit(1);
  }
}

removeTurbopackDebugMarkers();
