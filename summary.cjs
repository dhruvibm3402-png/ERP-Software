const fs = require('fs');

const log = fs.readFileSync('tsc3.log', 'utf8').split('\n');
const errors = [];
let currentCode = '';
for (const line of log) {
    if (line.includes('error TS')) {
        const fileMatch = line.match(/^([a-zA-Z0-9_.\-\/\\]+\.tsx?)\(\d+,\d+\):\s*(error TS\d+:\s*.*)/);
        if (fileMatch) {
            errors.push({ file: fileMatch[1], msg: fileMatch[2] });
        }
    }
}

const categorized = {};
for (const e of errors) {
    if (!categorized[e.file]) categorized[e.file] = [];
    categorized[e.file].push(e.msg);
}

for (const [file, msgs] of Object.entries(categorized)) {
    console.log('\n--- ' + file + ' ---');
    console.log(msgs.slice(0, 3).join('\n'));
    if (msgs.length > 3) console.log(`... and ${msgs.length - 3} more`);
}
