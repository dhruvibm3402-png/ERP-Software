import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

for (const sf of project.getSourceFiles()) {
    if (!sf.getFilePath().includes('api')) continue;

    let modified = false;
    for (const func of sf.getFunctions()) {
        const name = func.getName();
        if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(name) && func.isExported()) {
            const params = func.getParameters();
            if (params.length > 1) {
                const secondParam = params[1];
                if (secondParam.getTypeNode() && secondParam.getTypeNode().getText().includes('params')) {
                    secondParam.setType('any');
                    modified = true;
                }
            }
        }
    }

    // Convert synchronous params access to await.
    // e.g. const { id } = context.params; -> const { id } = await context.params;
    let t = sf.getFullText();
    let change = t.replace(/const\s+\{\s*([a-zA-Z0-9_,\s]+)\s*\}\s*=\s*(?:context\.params|params)\s*;/g, "const { $1 } = await context.params;");
    if (t !== change) {
        sf.replaceWithText(change);
        modified = true;
    }

    if (modified) {
        sf.saveSync();
        console.log('Fixed Next.js 15 route signature in:', sf.getFilePath());
    }
}
