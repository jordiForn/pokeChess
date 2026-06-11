const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL?.trim();
const target = path.join(__dirname, '../src/environments/environment.production.ts');

if (!apiUrl) {
  console.error('ERROR: API_URL is not set. Configure it in Vercel before building.');
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl.replace(/'/g, "\\'")}',
};
`;

fs.writeFileSync(target, content, 'utf8');
console.log('Production API URL:', apiUrl);
