const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.css') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk('c:/Users/hp/Documents/All Projectts/Educational-adventure-path-way-scholarship-based-platform/frontend/educationalpathway/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove shadows: matches 'shadow' 'shadow-sm', 'shadow-md', etc.
    content = content.replace(/(?<!-)\bshadow(?:-(?:sm|md|lg|xl|2xl|inner|none))?\b(?!-)/g, '');

    // Replace rounding variations: matches 'rounded', 'rounded-sm', 'rounded-md', 'rounded-xl', 'rounded-2xl', 'rounded-none'
    content = content.replace(/(?<!-)\brounded(?:-(?:sm|md|xl|2xl|none))?\b(?!-)/g, 'rounded-lg');

    // Make sure we don't end up with multiple repeated spaces in className strings
    content = content.replace(/className=["']([^"']*)["']/g, (match, p1) => {
        const cleaned = p1.replace(/\s+/g, ' ').trim();
        return `className="${cleaned}"`;
    });

    if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
