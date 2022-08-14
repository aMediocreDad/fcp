import { execa } from "execa";
import { writeFile } from "fs/promises";

const stdio = "inherit";

// Generate new version
await execa("npx", ["changeset", "version"], { stdio });

// Update module.json
const packageJson = await import("../package.json", { assert: { type: "json" } });
const version = packageJson.version;

const { default: manifestFile } = await import("../module.json", { assert: { type: "json" } });
const manifest = { ...manifestFile };

const previousVersion = manifestFile.version;

manifest.version = version;
manifest.download = manifest.download.replace(previousVersion, version);
await writeFile("./module.json", JSON.stringify(manifest, null, "\t"), "utf8");

// Commit changes
await execa("git", ["add", "-A"], { stdio });
await execa("git", ["commit", "-m", `chore(release): v${version}`], { stdio });

// Tag version
await execa("npx", ["changeset", "tag"], { stdio });

// Push changes
await execa("git", ["push", "origin", "main", "--tags"], { stdio });
