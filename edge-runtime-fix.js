// This script adds the Edge Runtime configuration to all API route files
const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'app', 'api');

function addEdgeRuntimeToFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      addEdgeRuntimeToFiles(filePath);
    } else if (file.name === 'route.ts' || file.name === 'route.js') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (!content.includes('export const runtime')) {
        content = `export const runtime = 'edge';\n\n${content}`;
        fs.writeFileSync(filePath, content);
        console.log(`Added Edge Runtime to: ${filePath}`);
      }
    }
  }
}

addEdgeRuntimeToFiles(apiDir);
console.log('Edge Runtime configuration added to all API routes!');
