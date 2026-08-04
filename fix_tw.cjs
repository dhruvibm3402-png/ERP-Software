const fs = require('fs');
let content = fs.readFileSync('app/globals.css', 'utf8');
if (!content.includes('@import "tailwindcss"')) {
    fs.writeFileSync('app/globals.css', '@import "tailwindcss";\n' + content);
    console.log('Fixed Tailwind');
} else {
    console.log('Already fixed.');
}
