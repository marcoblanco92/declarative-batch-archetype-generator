const express = require("express");
const cors = require("cors");
const path = require("path");
const { generateProjectZip } = require("./src/services/generator");

const app = express();
app.use(express.json());

// Abilita CORS for FE App
app.use(cors({ origin: "http://localhost:5173" }));

// API 1: Generate project + YAML + ZIP
app.post("/generate-zip", async (req, res) => {
  try {
    const { groupId, artifactId, pkg, version, generatedYaml } = req.body;

    // Generate ZIP file (project folder cleanup handled inside)
    const zipPath = await generateProjectZip({
      groupId,
      artifactId,
      pkg,
      version,
      generatedYaml,
    });

    console.log("ZIP generated at:", zipPath);

    // Return ZIP path to frontend (could be relative or a unique ID)
    res.sendFile(path.resolve(zipPath), (err) => {
      if (err) console.error(err);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error generating the ZIP file" });
  }
});

// API 2: Generate project + YAML + push to new Git repo
app.post("/generate-repo", async (req, res) => {
  try {
    const { artifactId, pkg, version, generatedYaml, gitRemoteUrl } = req.body;
    await generateProjectAndPushRepo({
      artifactId,
      pkg,
      version,
      generatedYaml,
      gitRemoteUrl,
    });
    res.send({ message: "Repository created and pushed successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ error: "Error creating and pushing the repository" });
  }
});

app.listen(3000, () => {
  console.log("Node.js server listening on http://localhost:3000");
});
