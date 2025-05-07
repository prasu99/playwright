const fs = require('fs');

const filePath = './test-results/results.json';

if (!fs.existsSync(filePath)) {
  console.error('❌ No results.json found!');
  process.exit(1);
}

const raw = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(raw);

// Print top-level structure
console.log('🔍 Top-level keys:', Object.keys(data));

// Print nested structure
if (data.suites && data.suites.length > 0) {
  console.log(`📦 Found ${data.suites.length} top-level suite(s)`);
  console.log('🧪 Sample suite keys:', Object.keys(data.suites[0]));

  const nested = data.suites[0].suites?.[0]?.tests;
  if (nested) {
    console.log(`✅ Found ${nested.length} test(s)`);
    console.log('➡️ Sample test title:', nested[0].title);
    console.log('➡️ Status:', nested[0].results?.[0]?.status);
  } else {
    console.warn('⚠️ No nested tests found inside suites');
  }
} else {
  console.error('❌ No test suites found in results.json');
}
