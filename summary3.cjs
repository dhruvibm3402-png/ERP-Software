const fs = require('fs');
const lines = fs.readFileSync('tsc.log', 'utf8').split('\n');
let lastFile = null;
let errCount = 0;
for (const line of lines) {
    if (line.includes('error TS')) {
        const file = line.split('(')[0];
        if (file !== lastFile) {
            if (lastFile) console.log(lastFile, ':', errCount, 'errors');
            lastFile = file;
            errCount = 0;
            console.log('\n--- ' + file + ' ---');
            console.log(line.trim());
        }
        errCount++;
    }
}
if (lastFile) console.log(lastFile, ':', errCount, 'errors');
