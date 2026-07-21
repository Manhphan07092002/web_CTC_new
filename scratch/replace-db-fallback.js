import fs from 'fs';
import path from 'path';

const TARGET_DIRECTORIES = ['scripts', 'server', 'services', 'seed-data'];
const EXTENSIONS = ['.js', '.ts', '.md', '.json'];
const SEARCH_VAL = /web-tranle1/g;
const REPLACE_VAL = 'ctc_web_new';

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      if (EXTENSIONS.includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (SEARCH_VAL.test(content)) {
          console.log(`✏️ Replacing in: ${fullPath}`);
          content = content.replace(SEARCH_VAL, REPLACE_VAL);
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      }
    }
  }
}

function run() {
  console.log(`🔍 Starting replace of database name 'web-tranle1' with '${REPLACE_VAL}'...`);
  for (const dir of TARGET_DIRECTORIES) {
    const dirPath = path.resolve(dir);
    if (fs.existsSync(dirPath)) {
      processDirectory(dirPath);
    }
  }
  console.log('✨ All replacements completed!');
}

run();
