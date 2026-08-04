const fs = require('fs');
const lines = fs.readFileSync('tsc3.log', 'utf8').split('\n');
const errs = new Map();
for (const l of lines) {
    if (l.includes('error TS')) {
        const file = l.split('(')[0];
        if (!errs.has(file)) errs.set(file, []);
        errs.get(file).push(l.trim());
    }
}
for (const [f, msgs] of errs.entries()) {
    console.log('\n--- ' + f + ' (' + msgs.length + ') ---');
    console.log(msgs[0]);
}
