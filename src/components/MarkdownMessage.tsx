import type { ReactNode } from "react";

type Block =
  | { type: "code"; language: string; content: string }
  | { type: "heading"; level: 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "quote"; content: string }
  | { type: "list"; ordered: boolean; items: string[] };

const inlineToken = /(`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;

function isListLine(line: string) {
  return /^\s*(?:[-*]\s+|\d+\.\s+)/.test(line);
}

function parseListLine(line: string) {
  return line.replace(/^\s*(?:[-*]\s+|\d+\.\s+)/, "");
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trimStart().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trimStart().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push({ type: "code", language, content: code.join("\n") });
      continue;
    }

    if (/^###\s+/.test(line)) {
      blocks.push({ type: "heading", level: 3, content: line.replace(/^###\s+/, "") });
      index += 1;
      continue;
    }

    if (/^##\s+/.test(line)) {
      blocks.push({ type: "heading", level: 2, content: line.replace(/^##\s+/, "") });
      index += 1;
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", content: quote.join("\n") });
      continue;
    }

    if (isListLine(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (index < lines.length && isListLine(lines[index])) {
        items.push(parseListLine(lines[index]));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trimStart().startsWith("```") &&
      !/^#{2,3}\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !isListLine(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "paragraph", content: paragraph.join("\n") });
  }

  return blocks;
}

function renderInline(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  inlineToken.lastIndex = 0;

  for (const match of content.matchAll(inlineToken)) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(<code key={`code-${match.index}`}>{match[2]}</code>);
    } else if (match[3]) {
      nodes.push(<strong key={`strong-${match.index}`}>{renderInline(match[3])}</strong>);
    } else if (match[4]) {
      nodes.push(<em key={`em-${match.index}`}>{renderInline(match[4])}</em>);
    } else if (match[5] && match[6]) {
      nodes.push(
        <a key={`link-${match.index}`} href={match[6]} target="_blank" rel="noreferrer">
          {renderInline(match[5])}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return nodes;
}

export function MarkdownMessage({ content }: { content: string }) {
  if (!content) {
    return <div className="markdown-message muted-message">Writing...</div>;
  }

  return (
    <div className="markdown-message">
      {parseBlocks(content).map((block, index) => {
        if (block.type === "code") {
          return (
            <pre key={`block-${index}`} className="code-block">
              {block.language ? <span className="code-language">{block.language}</span> : null}
              <code>{block.content}</code>
            </pre>
          );
        }
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3";
          return <Tag key={`block-${index}`}>{renderInline(block.content)}</Tag>;
        }
        if (block.type === "quote") {
          return <blockquote key={`block-${index}`}>{renderInline(block.content)}</blockquote>;
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={`block-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={`block-${index}`}>{renderInline(block.content)}</p>;
      })}
    </div>
  );
}
