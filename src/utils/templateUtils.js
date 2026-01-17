const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

/**
 * Helper: capitalize
 */
Handlebars.registerHelper("capitalize", function (value) {
  if (typeof value !== "string") {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
});


Handlebars.registerHelper("capitalizeJdbcType", function (type) {
  if (!type || typeof type !== "string") {
    return type;
  }

  const map = {
    string: "String",
    int: "Int",
    integer: "Int",
    long: "Long",
    boolean: "Boolean",
    date: "Date",
    timestamp: "Timestamp",
    bigdecimal: "BigDecimal",
    double: "Double"
  };

  const normalized = type.toLowerCase();
  return map[normalized] || (
    normalized.charAt(0).toUpperCase() + normalized.slice(1)
  );
});


/**
 * Generate a file from a Handlebars template.
 * @param {string} templateName - Template filename in the templates folder
 * @param {string} outputPath - Full path where the generated file will be saved
 * @param {object} data - Data to be injected into the template
 */
function generateFromTemplate(templateName, outputPath, data) {
  const templatePath = path.resolve(__dirname, "..", "templates", templateName);
  const templateContent = fs.readFileSync(templatePath, "utf8");

  const compiledTemplate = Handlebars.compile(templateContent);
  const result = compiledTemplate(data);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result, "utf8");
}

module.exports = { generateFromTemplate };
