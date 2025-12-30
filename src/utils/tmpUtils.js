const fs = require('fs');

/**
 * Deletes a directory recursively if it exists
 */
function cleanDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
        }
    } catch (err) {
        console.warn(`Failed to clean directory ${dirPath}:`, err);
    }
}

module.exports = { cleanDirectory };
