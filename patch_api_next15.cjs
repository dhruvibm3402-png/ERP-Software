const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Fix the Next.js 15 route handler parameter constraint
            // Match: export async function POST(request: Request, context: { params: { id: string } }) {
            // Replace with: export async function POST(request: Request, context: any) { const params = await context.params; ... }

            content = content.replace(/(export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\(\s*[^,]+,\s*)(?:\{?\s*params\s*\}?\s*:\s*\{[^}]+\}|context\s*:\s*\{[^}]+\})(\s*\)\s*\{)/g, (match, p1, p2) => {
                // If the match used `{ params }`, we rewrite the function to accept `context: any` 
                // and inject `const params = await context.params;` later
                return `${p1}context: any${p2}`;
            });

            // Additionally, replace `const { id } = context.params;` with `const { id } = await context.params;`
            content = content.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*(?:context\.params|params)\s*;/g, "const { $1 } = await context.params;");

            // If they did `context.params.id`, replace with `(await context.params).id`
            content = content.replace(/context\.params\.id/g, "(await context.params).id");

            // Fix `import { Request } from 'next/server'` if present but not needed, it's fine.
            // Some signatures are `export async function GET(req: Request, { params }: any) {`
            content = content.replace(/(export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\(\s*[^,]+,\s*)\{\s*params\s*\}(?:\s*:\s*any)?(\s*\)\s*\{)/g, (match, p1, p2) => {
                return `${p1}context: any${p2}\n    const params = await context.params;`;
            });
            content = content.replace(/(export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\(\s*[^,]+,\s*)context\s*:\s*any(\s*\)\s*\{)/g, (match, p1, p2) => {
                // Check if `const params = await context.params` is already injected
                // We will just do a check in the next step. For now, rely on `const { id } = context.params` being patched to `const { id } = await context.params;`.
                return `${p1}context: any${p2}`;
            });

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Patched API:', fullPath);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'app/api'));
