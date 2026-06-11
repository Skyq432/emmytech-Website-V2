import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredPaths = [
  'app/page.tsx',
  'app/about/page.tsx',
  'app/services/page.tsx',
  'app/products/page.tsx',
  'app/portfolio/page.tsx',
  'app/ambassador/page.tsx',
  'app/contact/page.tsx',
  'components/Header.tsx',
  'components/Footer.tsx',
  'components/PageHero.tsx',
  'components/ImageSlot.tsx',
  'lib/site-data.ts',
  'docs/PROJECT-MANAGER-AGENT.md',
];

let failed = false;
console.log('\nEmmy Technology Project Manager Check\n');

for (const file of requiredPaths) {
  const exists = fs.existsSync(path.join(root, file));
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) failed = true;
}

const siteData = fs.readFileSync(path.join(root, 'lib/site-data.ts'), 'utf8');
const requiredContent = ['#032489', '#ffb100', 'University of Ibadan', 'Sango', 'recommendedImages'];
for (const item of requiredContent) {
  const exists = siteData.includes(item);
  console.log(`${exists ? '✓' : '✗'} content check: ${item}`);
  if (!exists) failed = true;
}

if (failed) {
  console.error('\nProject manager check failed. Review the missing items above.\n');
  process.exit(1);
}

console.log('\nAll project manager checks passed.\n');
