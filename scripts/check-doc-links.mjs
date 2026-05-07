#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const ignoredDirs = new Set([
  '.git',
  '.dev',
  '.m2',
  '.playwright',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'storybook-static',
  'target',
  'test-results',
]);

function walkMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...walkMarkdownFiles(path.join(dir, entry.name)));
      }
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

function stripInlineMarkdown(value) {
  return value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .trim();
}

function slugify(heading) {
  return stripInlineMarkdown(heading)
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s_-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function headingAnchors(content) {
  const anchors = new Set();
  const seen = new Map();
  for (const line of content.split(/\r?\n/)) {
    const match = /^(#{1,6})\s+(.+?)\s*#*$/.exec(line);
    if (!match) {
      continue;
    }
    const base = slugify(match[2]);
    if (!base) {
      continue;
    }
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
}

function markdownLinks(content) {
  const links = [];
  const linkPattern = /(?<!!)\[[^\]\n]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function isExternal(link) {
  return /^(https?:|mailto:|tel:)/i.test(link);
}

function splitLink(link) {
  const hashIndex = link.indexOf('#');
  if (hashIndex === -1) {
    return { target: decodeURIComponent(link), anchor: '' };
  }
  return {
    target: decodeURIComponent(link.slice(0, hashIndex)),
    anchor: decodeURIComponent(link.slice(hashIndex + 1)),
  };
}

const markdownFiles = walkMarkdownFiles(rootDir);
const anchorCache = new Map();
const errors = [];

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8');
  anchorCache.set(file, headingAnchors(content));
}

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const fileDir = path.dirname(file);
  for (const rawLink of markdownLinks(content)) {
    if (isExternal(rawLink) || rawLink.startsWith('<') || rawLink.startsWith('{')) {
      continue;
    }

    const { target, anchor } = splitLink(rawLink);
    const targetPath = target
      ? path.resolve(fileDir, target)
      : file;

    if (target && !fs.existsSync(targetPath)) {
      errors.push(`${path.relative(rootDir, file)} -> missing target: ${rawLink}`);
      continue;
    }

    if (anchor) {
      if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
        errors.push(`${path.relative(rootDir, file)} -> anchor target is not a file: ${rawLink}`);
        continue;
      }
      const anchors = anchorCache.get(targetPath) ?? headingAnchors(fs.readFileSync(targetPath, 'utf8'));
      const normalizedAnchor = anchor.toLowerCase();
      if (!anchors.has(normalizedAnchor)) {
        errors.push(`${path.relative(rootDir, file)} -> missing anchor: ${rawLink}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error('Markdown link check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Checked ${markdownFiles.length} Markdown files.`);
