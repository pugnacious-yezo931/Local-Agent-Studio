const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const MIME_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".csv": "text/csv",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
};

function mimeTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function kindFor(mimeType) {
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  if (mimeType.startsWith("text/") || mimeType === "application/json") {
    return "text";
  }
  return "file";
}

function describeAttachment(filePath) {
  const absolutePath = path.resolve(filePath);
  const stat = fs.statSync(absolutePath);
  const mimeType = mimeTypeFor(absolutePath);
  return {
    id: randomUUID(),
    name: path.basename(absolutePath),
    path: absolutePath,
    mimeType,
    kind: kindFor(mimeType),
    size: stat.size,
  };
}

function describeAttachments(filePaths = []) {
  return filePaths.map(describeAttachment);
}

function readBase64Attachment(attachment) {
  const targetPath = attachment?.path;
  if (!targetPath) {
    return "";
  }
  return fs.readFileSync(path.resolve(targetPath)).toString("base64");
}

function attachmentContext(attachments = []) {
  if (!attachments.length) {
    return "";
  }

  return attachments
    .map((attachment, index) => {
      const sizeKb = Math.round(Number(attachment.size || 0) / 1024);
      return `${index + 1}. ${attachment.name} (${attachment.kind || "file"}, ${attachment.mimeType || "unknown"}, ${sizeKb} KB, ${attachment.path})`;
    })
    .join("\n");
}

function imageBase64List(attachments = []) {
  return attachments
    .filter((attachment) => attachment.kind === "image" || String(attachment.mimeType || "").startsWith("image/"))
    .map(readBase64Attachment)
    .filter(Boolean);
}

module.exports = {
  attachmentContext,
  describeAttachment,
  describeAttachments,
  imageBase64List,
};
