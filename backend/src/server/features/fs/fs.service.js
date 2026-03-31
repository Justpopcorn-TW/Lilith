import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');

const validatePath = (targetPath) => {
    const resolved = path.resolve(PROJECT_ROOT, targetPath);
    if (!resolved.startsWith(PROJECT_ROOT)) throw new Error("Access Denied: Path out of bounds.");
    return resolved;
};

export const fsService = {
    listDirectory: (dir) => {
        const dirPath = validatePath(dir || '.');
        if (!fs.existsSync(dirPath)) return [];
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        const result = items.map(item => ({
            name: item.name,
            type: item.isDirectory() ? 'folder' : 'file',
            path: path.relative(PROJECT_ROOT, path.join(dirPath, item.name))
        }));
        return result.sort((a, b) => (a.type === b.type ? 0 : a.type === 'folder' ? -1 : 1));
    },

    readFile: (filePath) => {
        const targetPath = validatePath(filePath);
        if (!fs.existsSync(targetPath)) throw new Error("File not found");
        if (fs.statSync(targetPath).isDirectory()) throw new Error("Cannot read directory");
        return fs.readFileSync(targetPath, 'utf-8');
    },

    writeFile: (relativePath, content, encoding = 'utf-8') => {
        const filePath = validatePath(relativePath);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        if (encoding === 'base64') fs.writeFileSync(filePath, Buffer.from(content, 'base64'));
        else fs.writeFileSync(filePath, content, 'utf-8');
        return filePath;
    },

    extractZip: (targetDir, base64Content) => {
        const absDir = validatePath(targetDir);
        if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });
        const tempZipPath = path.join(absDir, `temp_${Date.now()}.zip`);
        fs.writeFileSync(tempZipPath, Buffer.from(base64Content, 'base64'));
        new AdmZip(tempZipPath).extractAllTo(absDir, true); 
        fs.unlinkSync(tempZipPath);
        return absDir;
    },

    deleteFileOrDir: (targetPath) => {
        const filePath = validatePath(targetPath);
        if (!fs.existsSync(filePath)) throw new Error("File not found");
        if (fs.statSync(filePath).isDirectory()) fs.rmSync(filePath, { recursive: true, force: true });
        else fs.unlinkSync(filePath);
        return filePath;
    }
};