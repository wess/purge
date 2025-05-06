#!/usr/bin/env bun
import { readBundleInfo, findMatches } from "./utils";
import fs from "fs/promises";
import path from "path";
import { prompt } from "enquirer";

const SCAN_PATHS = [
  `${process.env.HOME}/Library/Preferences`,
  `${process.env.HOME}/Library/Application Support`,
  `${process.env.HOME}/Library/Caches`,
  `${process.env.HOME}/Library/Logs`,
  `${process.env.HOME}/Library/Containers`,
  "/Library/Preferences",
  "/Library/Application Support",
  "/Library/Caches",
  "/Library/Logs",
  "/var/db/receipts",
];

async function zap(appPaths: string[]) {
  // 1. Gather all candidates
  let allCandidates: string[] = [];
  for (const appPath of appPaths) {
    const { bundleName, bundleId } = await readBundleInfo(appPath);
    console.log(`\nScanning "${bundleName}" (${bundleId})…`);
    const matches = (
      await Promise.all(
        SCAN_PATHS.map((p) => findMatches(p, [bundleId, bundleName]))
      )
    ).flat();
    // include the .app itself
    allCandidates.push(appPath, ...matches);
  }

  if (allCandidates.length === 0) {
    console.log("No related files found.");
    return;
  }

  // 2. Prompt user to pick what to Trash
  const response = await prompt<{ keep: string[] }>({
    type: "multiselect",
    name: "keep",
    message: "Uncheck anything you want to KEEP; checked items will be TRASHED:",
    choices: allCandidates.map((file) => ({ name: file, value: file, checked: true })),
    result(names) {
      // Return a comma-separated string of checked values
      return Array.isArray(names) ? names.join(",") : names;
    },
  });

  const toTrash = allCandidates.filter((f) => !response.keep.includes(f));
  if (toTrash.length === 0) {
    console.log("Nothing selected for removal.");
    return;
  }

  // 3. Move each to ~/.Trash
  const trashDir = `${process.env.HOME}/.Trash`;
  for (const src of toTrash) {
    const dest = path.join(trashDir, path.basename(src));
    await fs.rename(src, dest).catch((e) => {
      console.error(`Failed to trash ${src}:`, e.message);
    });
  }

  console.log(`Trashed ${toTrash.length} items.`);
}

async function main() {
  const apps = process.argv.slice(2);
  if (apps.length === 0) {
    console.error("Usage: zapper /path/to/App1.app [/path/to/App2.app …]");
    process.exit(1);
  }
  await zap(apps);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});