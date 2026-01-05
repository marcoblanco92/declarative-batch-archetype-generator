const express = require("express");
const cors = require("cors");
const path = require("path");
const { generateProjectZip } = require("./src/services/mavenService");

const app = express();
app.use(express.json());

// Abilita CORS per il FE
app.use(cors({ origin: "http://localhost:5173" }));

/**
 * POST /generate-zip
 * Body:
 * {
 *   groupId: string,
 *   artifactId: string,
 *   pkg: string,
 *   version: string,
 *   steps: Array<{ name: string, input: JavaClass, output: JavaClass }>,
 *   generatedYaml: string
 * }
 */
app.post("/generate-zip", async (req, res) => {
  try {
    const { batch } = req.body;
    const { groupId, artifactId, pkg, version, steps, generatedYaml } = batch;

    console.log("Steps ricevuti:", steps);

    if (!groupId || !artifactId || !pkg || !version || !steps) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const zipPath = await generateProjectZip({
      groupId,
      artifactId,
      pkg,
      version,
      steps,
      generatedYaml,
    });

    res.sendFile(path.resolve(zipPath));
    console.log("resed path completed")
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error generating ZIP" });
  }
});

// Avvio server
app.listen(3000, () => {
  console.log("Node.js server listening on http://localhost:3000");
});
