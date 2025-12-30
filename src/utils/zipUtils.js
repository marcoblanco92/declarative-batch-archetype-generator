const fs = require('fs');
const archiver = require('archiver');

function createZip(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
        console.log('Creating ZIP at:', outPath);

        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);
        archive.on('warning', (err) => console.warn('ZIP warning:', err));

        archive.pipe(output);

        archive.directory(sourceDir, false, (entry) => {
            if (entry.name.startsWith('target')) {
                return false;
            }
            return entry;
        });

        archive.finalize();
    });
}

module.exports = { createZip };
