import {
  REQUIRED_JSON_FILES,
  REQUIRED_TEXT_FILES,
  loadControlPlane,
  repoRootFromCwd,
  validateControlPlaneShape,
  validateRequiredFiles,
} from "./control-plane-lib.mjs";

async function main() {
  const root = repoRootFromCwd();
  const errors = validateRequiredFiles(root);

  if (errors.length === 0) {
    for (const file of REQUIRED_JSON_FILES) {
      try {
        JSON.parse(await import("node:fs/promises").then(({ readFile }) => readFile(file, "utf8")));
      } catch (error) {
        errors.push(`invalid JSON in ${file}: ${error.message}`);
      }
    }
  }

  if (errors.length === 0) {
    try {
      errors.push(...validateControlPlaneShape(await loadControlPlane(root)));
    } catch (error) {
      errors.push(`failed to load control plane: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    console.error("Hermes control plane invalid:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Hermes control plane valid.");
  console.log(`Checked JSON files: ${REQUIRED_JSON_FILES.join(", ")}`);
  console.log(`Checked text files: ${REQUIRED_TEXT_FILES.join(", ")}`);
}

await main();
