const fs = require("node:fs");
const path = require("node:path");

const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".json",
  ".csv",
  ".html",
  ".htm",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".ps1",
  ".bat",
  ".cmd",
  ".log",
  ".xml",
  ".yaml",
  ".yml",
]);

function workspaceRoot(settings) {
  const root = path.resolve(settings.workspacePath || path.join(process.cwd(), "workspace"));
  fs.mkdirSync(root, { recursive: true });
  return root;
}

function resolveWorkspacePath(settings, targetPath = "") {
  const root = workspaceRoot(settings);
  const normalized = String(targetPath || "").replace(/^[/\\]+/, "");
  const resolved = path.resolve(root, normalized);
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;

  if (resolved !== root && !resolved.startsWith(rootWithSep)) {
    throw new Error("Path is outside the workspace");
  }

  return { root, absolutePath: resolved, relativePath: path.relative(root, resolved) || "." };
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function fileInfo(root, absolutePath) {
  const stat = fs.statSync(absolutePath);
  const relativePath = path.relative(root, absolutePath) || ".";
  return {
    name: path.basename(absolutePath),
    relativePath,
    absolutePath,
    type: stat.isDirectory() ? "directory" : "file",
    size: stat.isDirectory() ? 0 : stat.size,
    modifiedAt: stat.mtime.toISOString(),
    isText: stat.isFile() ? isTextFile(absolutePath) : false,
  };
}

function listFiles({ settings, directory = "", depth = 2 }) {
  const { root, absolutePath } = resolveWorkspacePath(settings, directory);
  if (!fs.existsSync(absolutePath)) {
    return { root, directory, files: [] };
  }

  const maxDepth = Math.max(0, Math.min(Number(depth || 2), 5));
  const files = [];

  function walk(currentPath, currentDepth) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      const absoluteEntry = path.join(currentPath, entry.name);
      files.push(fileInfo(root, absoluteEntry));
      if (entry.isDirectory() && currentDepth < maxDepth) {
        walk(absoluteEntry, currentDepth + 1);
      }
    }
  }

  walk(absolutePath, 0);
  files.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.relativePath.localeCompare(b.relativePath);
  });

  return { root, directory, files };
}

function readTextFile({ settings, filePath }) {
  const { root, absolutePath, relativePath } = resolveWorkspacePath(settings, filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${relativePath}`);
  }
  const stat = fs.statSync(absolutePath);
  if (!stat.isFile()) {
    throw new Error(`Not a file: ${relativePath}`);
  }
  if (stat.size > 1024 * 1024) {
    throw new Error(`File is too large to preview: ${relativePath}`);
  }
  if (!isTextFile(absolutePath)) {
    throw new Error(`Only text files can be read in the editor: ${relativePath}`);
  }

  return {
    root,
    relativePath,
    absolutePath,
    content: fs.readFileSync(absolutePath, "utf8"),
    info: fileInfo(root, absolutePath),
  };
}

function writeTextFile({ settings, filePath, content = "", overwrite = true }) {
  const { root, absolutePath, relativePath } = resolveWorkspacePath(settings, filePath);
  if (fs.existsSync(absolutePath) && !overwrite) {
    throw new Error(`File already exists: ${relativePath}`);
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, String(content), "utf8");
  return {
    root,
    relativePath,
    absolutePath,
    content: String(content),
    info: fileInfo(root, absolutePath),
  };
}

function appendTextFile({ settings, filePath, content = "" }) {
  const { root, absolutePath, relativePath } = resolveWorkspacePath(settings, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.appendFileSync(absolutePath, String(content), "utf8");
  return {
    root,
    relativePath,
    absolutePath,
    content: fs.readFileSync(absolutePath, "utf8"),
    info: fileInfo(root, absolutePath),
  };
}

function deleteWorkspacePath({ settings, filePath }) {
  const { root, absolutePath, relativePath } = resolveWorkspacePath(settings, filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Path not found: ${relativePath}`);
  }
  const stat = fs.statSync(absolutePath);
  if (stat.isDirectory()) {
    fs.rmSync(absolutePath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(absolutePath);
  }
  return { root, relativePath, absolutePath };
}

module.exports = {
  appendTextFile,
  deleteWorkspacePath,
  listFiles,
  readTextFile,
  resolveWorkspacePath,
  writeTextFile,
};
