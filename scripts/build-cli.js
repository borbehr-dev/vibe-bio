'use strict';

const { loadProfile } = require('../lib/store');
const { buildSite } = require('../lib/build');

try {
  const profile = loadProfile();
  const result = buildSite(profile);

  console.log('✓ Готово');
  console.log(`  Папка: ${result.outputDir}`);
  result.files.forEach((file) => console.log(`  • ${file}`));
} catch (error) {
  console.error('✗ Сборка не удалась:', error.message);
  process.exitCode = 1;
}
