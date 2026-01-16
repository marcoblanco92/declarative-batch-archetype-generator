const fs = require("fs");
const path = require("path");
const { createZip } = require("../utils/zipUtils");
const { runCommand } = require("../utils/execUtils");
const { cleanDirectory } = require("../utils/tmpUtils");
const { generateFromTemplate } = require("../utils/templateUtils");

/**
 * Generates a Maven project, adds application.yml, creates step classes and records
 * from templates, and packages everything into a ZIP file.
 *
 * @param {object} params - Project parameters
 * @param {string} params.gorupId - Maven groupId
 * @param {string} params.artifactId - Maven artifactId
 * @param {string} params.pkg - Base package for Java classes
 * @param {string} params.version - Project version
 * @param {string} params.generatedYaml - Content for application.yml
 * @param {Array} params.steps - Array of step definitions with input/output classes
 * @returns {Promise<string>} - Path to the generated ZIP file
 */
async function generateProjectZip({
  groupId,
  artifactId,
  pkg,
  version,
  generatedYaml,
  steps = [],
}) {
  // Define the base temporary directory under the project root
  const baseTmpDir = path.resolve(__dirname, "..", "..", "tmp");
  fs.mkdirSync(baseTmpDir, { recursive: true });

  // Define the path for the Maven-generated project
  const generatedProjectDir = path.join(baseTmpDir, artifactId);

  // Define the output ZIP file path (timestamped to avoid collisions)
  const zipPath = path.resolve(baseTmpDir, `${artifactId}-${Date.now()}.zip`);

  console.log("Temporary base directory:", baseTmpDir);
  console.log("Generated project directory:", generatedProjectDir);
  console.log("ZIP file path:", zipPath);

  try {
    // Maven command arguments to generate the project from the archetype
    const mvnArgs = [
      "archetype:generate",
      "-DarchetypeGroupId=com.marbl.declarative-batch",
      "-DarchetypeArtifactId=declarative-batch-archetype",
      "-DarchetypeVersion=0.0.1-SNAPSHOT",
      `-DgroupId=${groupId}`,
      `-DartifactId=${artifactId}`,
      `-Dversion=${version}`,
      `-Dpackage=${pkg}`,
      "-DinteractiveMode=false",
    ];

    // Execute the Maven command in the temporary directory
    await runCommand("mvn", mvnArgs, { cwd: baseTmpDir });

    // Create src/main/resources folder and write the application.yml
    const resourcesPath = path.join(
      generatedProjectDir,
      "src",
      "main",
      "resources"
    );
    fs.mkdirSync(resourcesPath, { recursive: true });
    fs.writeFileSync(
      path.join(resourcesPath, "application.yml"),
      generatedYaml,
      "utf8"
    );

    // Define the base path for Java classes
    const javaBasePath = path.join(
      generatedProjectDir,
      "src",
      "main",
      "java",
      ...pkg.split(".")
    );

    // Loop through all steps to generate Step classes and Input/Output records
    for (const step of steps) {
      // Generate the Steplet class
      generateFromTemplate(
        step.type === "STEP" ? "StepSteplet.java.hbs" : "Tasklet.java.hbs",
        path.join(javaBasePath, "step", `${step.name}.java`),
        {
          package: pkg,
          ...step,
        }
      );

      //Not generate any I/O classes if tasklet
      if (step.type === "TASKLET") continue;

      // Generate Input record class
      generateFromTemplate(
        "IORecord.java.hbs",
        path.join(javaBasePath, "dto", `${step.input.className}.java`),
        {
          package: pkg,
          ...step.input,
        }
      );

      // Generate Output record class
      generateFromTemplate(
        "IORecord.java.hbs",
        path.join(javaBasePath, "dto", `${step.output.className}.java`),
        {
          package: pkg,
          ...step.output,
        }
      );

      
      if (step.reader?.type === "JdbcPagingItemReader" && step.reader?.mapperClass) {
        const rowMapperTemplate =
          step.input.recordType === "record" ? "RowMapperRecord.java.hbs" : "RowMapperClass.java.hbs";

        generateFromTemplate(
          rowMapperTemplate,
          path.join(javaBasePath, "mapper", `${step.reader.mapperClass}.java`),
          { package: pkg, input: step.input, reader: step.reader }
        );
      }

    }

    // Create the ZIP file containing the entire generated project
    await createZip(generatedProjectDir, zipPath);
    console.log("return file zipPath", zipPath);
    return zipPath;
  } finally {
    // Cleanup the temporary generated project directory (keep the ZIP)
    cleanDirectory(generatedProjectDir);
  }
}

module.exports = { generateProjectZip };
