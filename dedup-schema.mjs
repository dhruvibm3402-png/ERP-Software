import { readFileSync, writeFileSync } from 'fs';

const text = readFileSync('./prisma/schema.prisma', 'utf8');
const lines = text.split('\n');

const seenModels = new Set();
const outputLines = [];
let inModel = false;
let modelName = '';
let depth = 0;
let skip = false;
let buffer = [];

for (const line of lines) {
    const modelMatch = line.match(/^model (\w+) \{/);
    if (modelMatch) {
        modelName = modelMatch[1];
        inModel = true;
        depth = 1;
        skip = seenModels.has(modelName);
        if (!skip) {
            seenModels.add(modelName);
            buffer = [line];
        }
    } else if (inModel) {
        for (const ch of line) {
            if (ch === '{') depth++;
            if (ch === '}') depth--;
        }
        if (!skip) buffer.push(line);
        if (depth <= 0) {
            if (!skip) {
                outputLines.push(...buffer, '');
            }
            inModel = false;
            skip = false;
            buffer = [];
        }
    } else {
        outputLines.push(line);
    }
}

// Remove trailing empty lines and normalize
const result = outputLines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
writeFileSync('./prisma/schema.prisma', result, 'utf8');
console.log(`Done. Unique models: ${seenModels.size}`);
console.log([...seenModels].sort().join(', '));
