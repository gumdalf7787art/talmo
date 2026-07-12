const fs = require('fs');
const path = require('path');

const dir = 'h:/talmo/toss-app/src';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.jsx')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Replace API calls with absolute URLs
    content = content.replace(/fetch\('\/api\//g, "fetch('https://talmotalk.com/api/");
    content = content.replace(/fetch\(`\/api\//g, "fetch(`https://talmotalk.com/api/");
    content = content.replace(/fetch\("\/api\//g, 'fetch("https://talmotalk.com/api/');
    
    fs.writeFileSync(path.join(dir, file), content);
    console.log(`Updated ${file}`);
  }
});
