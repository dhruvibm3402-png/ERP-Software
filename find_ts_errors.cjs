const { execSync } = require('child_process');
try {
    const output = execSync('npx tsc --noEmit', { encoding: 'utf8' });
    console.log('No errors!');
} catch (e) {
    const lines = e.stdout.split('\n');
    const files = new Set();
    for (const line of lines) {
        if (line.includes('error TS') || line.includes(': error')) {
            const parts = line.split('(');
            if (parts.length > 1 && parts[0].includes('app/')) {
                files.add(parts[0]);
            } else if (line.includes('.ts:') || line.includes('.tsx:')) {
                files.add(line.split(':')[0]);
            }
        }
    }
    console.log([...files].join('\n'));
}
