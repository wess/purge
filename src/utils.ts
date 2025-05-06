import { promises as fs } from "fs";
import path from "path";
import plist from "plist";

/**
 * Recursively walk a directory, collecting files/folders whose
 * names match ANY of the given patterns.
 */
export async function findMatches(
  root: string,
  patterns: string[]
): Promise<string[]> {
  let results: string[] = [];
  try {
    for (const dirent of await fs.readdir(root, { withFileTypes: true })) {
      const p = path.join(root, dirent.name);
      // if name contains any pattern, record it
      if (patterns.some((pat) => dirent.name.includes(pat))) {
        results.push(p);
      }
      // recurse into directories
      if (dirent.isDirectory()) {
        results.push(...(await findMatches(p, patterns)));
      }
    }
  } catch {
    // ignore permissions errors, nonexistent dirs, etc.
  }
  return results;
}

/**
 * Given the path to a .app bundle, parse its Info.plist
 * and return { bundleName, bundleId }.
 */
export async function readBundleInfo(
  appPath: string
): Promise<{ bundleName: string; bundleId: string }> {
  const plistPath = path.join(appPath, "Contents", "Info.plist");
  const xml = await fs.readFile(plistPath, "utf8");
  const obj = plist.parse(xml) as Record<string, any>;
  return {
    bundleName: obj.CFBundleName ?? path.basename(appPath, ".app"),
    bundleId: obj.CFBundleIdentifier,
  };
}