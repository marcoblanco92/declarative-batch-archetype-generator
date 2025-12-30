const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { generateProjectZip } = require('./generator');

// Generates a project and pushes it to a new Git repository
async function generateProjectAndPushRepo({ artifactId, pkg, version, generatedYaml, gitRemoteUrl }) {
    const tempDir = path.join(__dirname, '..', '..', 'tmp', artifactId);
    fs.mkdirSync(tempDir, { recursive: true });

    // Generate project files and YAML
    await generateProjectZip({ artifactId, pkg, version, generatedYaml });

    // Initialize Git repo
    const git = simpleGit(tempDir);
    await git.init();
    await git.add('.');
    await git.commit('Initial commit');

    // Add remote and push
    await git.addRemote('origin', gitRemoteUrl);
    await git.push('origin', 'main', ['-u']);
}

module.exports = { generateProjectAndPushRepo };
