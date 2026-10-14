#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Native Messaging Host cho Markdown Reader Extension
 * Giao thức chuẩn Chrome / Edge Native Messaging:
 * Đọc/ghi qua stdio với tiền tố độ dài 4-byte (UInt32 little-endian).
 */

function sendMessage(msg) {
  try {
    const jsonStr = JSON.stringify(msg);
    const buffer = Buffer.from(jsonStr, 'utf8');
    const header = Buffer.alloc(4);
    header.writeUInt32LE(buffer.length, 0);
    process.stdout.write(header);
    process.stdout.write(buffer);
  } catch (err) {
    // Log lỗi nếu cần
  }
}

const SUPPORTED_EXTENSIONS = new Set([
  '.md', '.markdown', '.mdown', '.mkdn', '.mkd',
  '.txt', '.json', '.xml', '.yaml', '.yml',
  '.js', '.ts', '.jsx', '.tsx', '.cs', '.py',
  '.html', '.css', '.scss', '.sh', '.sql'
]);

function isSupported(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.has(ext);
}

function scanDirRecursive(dirPath, activeFileName = '') {
  let fileCount = 0;
  let dirCount = 0;

  function traverse(curDir, curRelPath) {
    const children = [];
    let entries = [];
    try {
      entries = fs.readdirSync(curDir, { withFileTypes: true });
    } catch (e) {
      return children;
    }

    for (const entry of entries) {
      const fullPath = path.join(curDir, entry.name);
      const relPath = curRelPath ? `${curRelPath}/${entry.name}` : entry.name;
      const normalizedPath = fullPath.replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '__pycache__') {
          continue;
        }
        dirCount++;
        const subChildren = traverse(fullPath, relPath);
        children.push({
          id: normalizedPath,
          name: entry.name,
          path: normalizedPath,
          isDirectory: true,
          children: subChildren
        });
      } else if (entry.isFile()) {
        if (isSupported(entry.name)) {
          fileCount++;
          let content = undefined;
          if (activeFileName && entry.name.toLowerCase() === activeFileName.toLowerCase()) {
            try {
              content = fs.readFileSync(fullPath, 'utf8');
            } catch (e) {}
          }
          children.push({
            id: normalizedPath,
            name: entry.name,
            path: normalizedPath,
            isDirectory: false,
            content
          });
        }
      }
    }

    return children.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  const baseName = path.basename(dirPath) || dirPath;
  const normalizedRootPath = dirPath.replace(/\\/g, '/');
  const children = traverse(dirPath, '');

  return {
    rootNode: {
      id: normalizedRootPath,
      name: baseName,
      path: normalizedRootPath,
      isDirectory: true,
      children
    },
    fileCount,
    dirCount
  };
}

let inputBuffer = Buffer.alloc(0);

process.stdin.on('data', (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);

  while (inputBuffer.length >= 4) {
    const msgLen = inputBuffer.readUInt32LE(0);
    if (inputBuffer.length < 4 + msgLen) {
      break; // Chờ đủ dữ liệu
    }

    const msgBuffer = inputBuffer.subarray(4, 4 + msgLen);
    inputBuffer = inputBuffer.subarray(4 + msgLen);

    try {
      const msg = JSON.parse(msgBuffer.toString('utf8'));
      handleMessage(msg);
    } catch (err) {
      sendMessage({ success: false, error: 'JSON parse error: ' + err.message });
    }
  }
});

function handleMessage(msg) {
  if (msg.action === 'ping') {
    sendMessage({ success: true, pong: true, version: '1.0.0' });
    return;
  }

  if (msg.action === 'scanDirectory') {
    let targetPath = msg.path || '';
    if (targetPath.startsWith('/') && targetPath.charAt(2) === ':') {
      targetPath = targetPath.substring(1);
    }
    targetPath = path.normalize(targetPath);

    if (!fs.existsSync(targetPath)) {
      sendMessage({ success: false, error: 'Thư mục không tồn tại: ' + targetPath });
      return;
    }

    try {
      const res = scanDirRecursive(targetPath, msg.activeFileName || '');
      sendMessage({
        success: true,
        rootNode: res.rootNode,
        fileCount: res.fileCount,
        dirCount: res.dirCount
      });
    } catch (err) {
      sendMessage({ success: false, error: err.message });
    }
    return;
  }

  if (msg.action === 'readFile') {
    let targetPath = msg.path || '';
    if (targetPath.startsWith('/') && targetPath.charAt(2) === ':') {
      targetPath = targetPath.substring(1);
    }
    targetPath = path.normalize(targetPath);

    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      sendMessage({ success: true, content });
    } catch (err) {
      sendMessage({ success: false, error: err.message });
    }
    return;
  }

  sendMessage({ success: false, error: 'Không hỗ trợ action: ' + msg.action });
}
