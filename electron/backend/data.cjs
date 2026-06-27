const fs = require("node:fs");
const path = require("node:path");
const { resolveWorkspacePath, writeTextFile } = require("./files.cjs");

let DatabaseSync = null;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch {
  DatabaseSync = null;
}

function sanitizeName(name) {
  const normalized = String(name || "database")
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `database-${Date.now()}`;
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        return null;
      }
    }

    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        return null;
      }
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        return null;
      }
    }
  }

  return null;
}

function parseCsv(text) {
  const lines = String(text || "")
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2 || !lines[0].includes(",")) {
    return [];
  }

  const headers = lines[0].split(",").map((value) => value.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header || `column_${index + 1}`, values[index] || ""]));
  });
}

function recordsFromText(text) {
  const parsed = extractJson(text);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => (item && typeof item === "object" ? item : { value: item }));
  }
  if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.items)) {
      return parsed.items.map((item) => (item && typeof item === "object" ? item : { value: item }));
    }
    return [parsed];
  }

  return parseCsv(text);
}

function collectColumns(records) {
  const columns = new Set();
  for (const record of records) {
    if (record && typeof record === "object" && !Array.isArray(record)) {
      for (const key of Object.keys(record)) {
        columns.add(key);
      }
    }
  }
  return [...columns];
}

function csvEscape(value) {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function toCsv(records, columns) {
  if (!columns.length) {
    return "";
  }
  const header = columns.map(csvEscape).join(",");
  const rows = records.map((record) => columns.map((column) => csvEscape(record?.[column])).join(","));
  return [header, ...rows].join("\n");
}

function createSqliteDatabase(sqlitePath, records) {
  if (!DatabaseSync) {
    return false;
  }

  const db = new DatabaseSync(sqlitePath);
  try {
    db.exec("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL)");
    const insert = db.prepare("INSERT INTO items (data) VALUES (?)");
    for (const record of records) {
      insert.run(JSON.stringify(record));
    }
  } finally {
    db.close();
  }
  return true;
}

function createDatabaseFromText({ settings, name = "database", text = "" }) {
  const dbName = sanitizeName(name);
  const records = recordsFromText(text);
  const columns = collectColumns(records);
  const createdAt = new Date().toISOString();
  const database = {
    version: 1,
    name: dbName,
    createdAt,
    tables: {
      items: {
        columns,
        rows: records,
      },
    },
  };

  const jsonFile = `databases/${dbName}.db.json`;
  const jsonResult = writeTextFile({
    settings,
    filePath: jsonFile,
    content: JSON.stringify(database, null, 2),
    overwrite: true,
  });

  let csvResult = null;
  if (records.length && columns.length) {
    csvResult = writeTextFile({
      settings,
      filePath: `databases/${dbName}.csv`,
      content: toCsv(records, columns),
      overwrite: true,
    });
  }

  const { absolutePath: sqlitePath } = resolveWorkspacePath(settings, `databases/${dbName}.sqlite`);
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  let sqliteCreated = false;
  try {
    if (fs.existsSync(sqlitePath)) {
      fs.unlinkSync(sqlitePath);
    }
    sqliteCreated = createSqliteDatabase(sqlitePath, records);
  } catch {
    sqliteCreated = false;
  }

  return {
    name: dbName,
    rows: records.length,
    columns,
    jsonPath: jsonResult.absolutePath,
    jsonRelativePath: jsonResult.relativePath,
    csvPath: csvResult?.absolutePath || "",
    csvRelativePath: csvResult?.relativePath || "",
    sqlitePath: sqliteCreated ? sqlitePath : "",
    sqliteRelativePath: sqliteCreated ? path.relative(jsonResult.root, sqlitePath) : "",
    sqliteAvailable: Boolean(DatabaseSync),
  };
}

module.exports = {
  createDatabaseFromText,
  recordsFromText,
};
