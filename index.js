const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { generateProjectZip } = require("./src/services/mavenService");

const app = express();

// Enable CORS for all localhost origins (development mode)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  exposedHeaders: ["Content-Disposition"]
}));

// Parse JSON bodies
app.use(express.json());

/**
 * POST /generate-zip
 * Body:
 * {
 *   batch: {
 *     groupId: string,
 *     artifactId: string,
 *     pkg: string,
 *     version: string,
 *     steps: Array,
 *     generatedYaml: string
 *   }
 * }
 */
app.post("/generate-zip", async (req, res) => {
  let zipPath = null;
  
  try {
    const { batch } = req.body;
    
    if (!batch) {
      return res.status(400).json({ error: "Missing 'batch' in request body" });
    }

    const { groupId, artifactId, pkg, version, steps, generatedYaml } = batch;

    console.log("=".repeat(50));
    console.log("📦 Generating project:", artifactId);
    console.log("📊 Steps count:", steps?.length || 0);
    console.log("=".repeat(50));

    // Validate required fields
    if (!groupId || !artifactId || !pkg || !version || !steps) {
      return res.status(400).json({ 
        error: "Missing required fields",
        received: { groupId: !!groupId, artifactId: !!artifactId, pkg: !!pkg, version: !!version, steps: !!steps }
      });
    }

    // Generate ZIP file with the project
    zipPath = await generateProjectZip({
      groupId,
      artifactId,
      pkg,
      version,
      steps,
      generatedYaml,
    });

    console.log("✅ ZIP file generated at:", zipPath);

    // Check if file exists
    if (!fs.existsSync(zipPath)) {
      throw new Error("ZIP file was not created");
    }

    const stats = fs.statSync(zipPath);
    console.log("📦 ZIP file size:", (stats.size / 1024).toFixed(2), "KB");

    // Set appropriate headers for file download
    const fileName = path.basename(zipPath);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", stats.size);

    // Send the file
    res.sendFile(path.resolve(zipPath), (err) => {
      if (err) {
        console.error("❌ Error sending file:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error sending ZIP file" });
        }
      } else {
        console.log("✅ ZIP file sent successfully:", fileName);
        
        // Optional: Delete the file after sending (after 5 seconds)
        setTimeout(() => {
          if (fs.existsSync(zipPath)) {
            try {
              fs.unlinkSync(zipPath);
              console.log("🗑️  ZIP file deleted:", zipPath);
            } catch (cleanupErr) {
              console.error("⚠️  Error deleting ZIP:", cleanupErr.message);
            }
          }
        }, 5000);
      }
    });

  } catch (err) {
    console.error("❌ Error generating ZIP:", err);
    console.error(err.stack);
    
    // Cleanup zip file if it was created
    if (zipPath && fs.existsSync(zipPath)) {
      try {
        fs.unlinkSync(zipPath);
        console.log("🗑️  Cleaned up failed ZIP:", zipPath);
      } catch (cleanupErr) {
        console.error("⚠️  Error cleaning up ZIP:", cleanupErr.message);
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Error generating ZIP", 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log(`🚀 Node.js server listening on http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for all localhost origins`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log("=".repeat(50));
});