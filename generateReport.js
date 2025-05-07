const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Read the JSON test results file
const resultsFile = './test-results/results.json';

if (!fs.existsSync(resultsFile)) {
  console.error('❌ Test results not found. Run "npx playwright test --reporter=json" first.');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));

// Create screenshots folder if it doesn't exist
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Create HTML Report
const generateHTMLReport = () => {
  let reportContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Playwright Test Report</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }
        h1 { text-align: center; }
        .test-case { background: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 20px; }
        .status { font-weight: bold; }
        .screenshot { width: 300px; margin-top: 10px; border: 1px solid #ddd; }
        .passed { color: green; }
        .failed { color: red; }
      </style>
    </head>
    <body>
      <h1>Playwright Test Report</h1>
  `;

  results.suites?.forEach(suite => {
    suite.specs?.forEach(spec => {
      spec.tests?.forEach(test => {
        const title = Array.isArray(test.title) ? test.title.join(' ') : test.title;
        const status = test.results[0]?.status || 'unknown';
        const screenshotPath = `screenshots/${title.replace(/ /g, '-')}.png`;

        reportContent += `
          <div class="test-case">
            <h2>${title}</h2>
            <p class="status ${status}">Status: ${status.toUpperCase()}</p>
            <img src="${screenshotPath}" class="screenshot" alt="Screenshot not found">
          </div>
        `;
      });
    });
  });

  reportContent += `</body></html>`;
  fs.writeFileSync('report.html', reportContent, 'utf-8');
  console.log('✅ Report generated: report.html');

  // Auto-open on Windows
  if (process.platform === 'win32') {
    exec('start report.html');
  }
};

generateHTMLReport();
