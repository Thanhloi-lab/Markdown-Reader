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

    // Chrome Native Messaging giới hạn 1 MB (1,048,576 bytes)
    if (buffer.length > 1000 * 1024) {
      const errMsg = {
        success: false,
        error: `Kích thước dữ liệu cây thư mục (${Math.round(buffer.length / 1024)} KB) vượt quá giới hạn 1MB của trình duyệt. Vui lòng mở trực tiếp thư mục con.`
      };
      const errBuffer = Buffer.from(JSON.stringify(errMsg), 'utf8');
      const errHeader = Buffer.alloc(4);
      errHeader.writeUInt32LE(errBuffer.length, 0);
      process.stdout.write(errHeader);
      process.stdout.write(errBuffer);
      return;
    }

    const header = Buffer.alloc(4);
    header.writeUInt32LE(buffer.length, 0);
    process.stdout.write(header);
    process.stdout.write(buffer);
  } catch (err) {
    // Log lỗi nếu cần
  }
}

const SUPPORTED_EXTENSIONS = new Set([
  '.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdx',
  '.txt', '.json', '.xml', '.yaml', '.yml', '.toml', '.csv',
  '.js', '.ts', '.jsx', '.tsx', '.cs', '.py',
  '.html', '.css', '.scss', '.sh', '.sql', '.log'
]);

const IGNORED_DIRECTORIES = new Set([
  'node_modules', 'dist', 'build', 'out', 'target', 'bin', 'obj',
  '.next', '.nuxt', '.output', '.turbo', 'vendor', 'coverage', 'pods',
  '__pycache__', 'appdata', 'application data', '$recycle.bin',
  'system volume information', 'windows', 'program files', 'program files (x86)',
  'temp', 'cache', '.cache'
]);

function isSupported(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.has(ext);
}

function scanDirSmart(dirPath, activeFilePath = '', shallow = true, maxDepth = 4, maxFiles = 2500) {
  let fileCount = 0;
  let dirCount = 0;
  const normActive = activeFilePath ? activeFilePath.replace(/\\/g, '/').toLowerCase() : '';

  function traverse(curDir, currentDepth) {
    const children = [];
    let entries = [];
    try {
      entries = fs.readdirSync(curDir, { withFileTypes: true });
    } catch (e) {
      return children;
    }

    // 1. Quét file trước
    if (fileCount < maxFiles) {
      for (const entry of entries) {
        if (entry.isFile()) {
          if (entry.name.startsWith('.')) continue;
          if (isSupported(entry.name)) {
            fileCount++;
            const fullPath = path.join(curDir, entry.name).replace(/\\/g, '/');
            children.push({
              id: fullPath,
              name: entry.name,
              path: fullPath,
              isDirectory: false
            });
            if (fileCount >= maxFiles) break;
          }
        }
      }
    }

    // 2. Quét thư mục sau
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) {
          continue;
        }
        dirCount++;
        const fullPath = path.join(curDir, entry.name).replace(/\\/g, '/');
        const normSub = fullPath.toLowerCase();
        const isActiveBranch = normActive && (normActive === normSub || normActive.startsWith(normSub + '/'));

        if (shallow && !isActiveBranch) {
          children.push({
            id: fullPath,
            name: entry.name,
            path: fullPath,
            isDirectory: true,
            isLoaded: false,
            children: []
          });
        } else {
          if (currentDepth < maxDepth && fileCount < maxFiles) {
            const subChildren = traverse(fullPath, currentDepth + 1);
            children.push({
              id: fullPath,
              name: entry.name,
              path: fullPath,
              isDirectory: true,
              isLoaded: true,
              children: subChildren
            });
            if (fileCount >= maxFiles) break;
          } else {
            children.push({
              id: fullPath,
              name: entry.name,
              path: fullPath,
              isDirectory: true,
              isLoaded: false,
              children: []
            });
          }
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
  const children = traverse(dirPath, 0);

  return {
    rootNode: {
      id: normalizedRootPath,
      name: baseName,
      path: normalizedRootPath,
      isDirectory: true,
      isLoaded: true,
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
      break;
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
    sendMessage({ success: true, pong: true, version: '1.3.0' });
    return;
  }

  if (msg.action === 'scanDirectory') {
    let targetPath = msg.path || '';
    if (targetPath.startsWith('/') && targetPath.charAt(2) === ':') {
      targetPath = targetPath.substring(1);
    }
    targetPath = path.normalize(targetPath);

    try {
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        targetPath = path.dirname(targetPath);
      }
    } catch {}

    if (!fs.existsSync(targetPath)) {
      sendMessage({ success: false, error: 'Thư mục không tồn tại: ' + targetPath });
      return;
    }

    try {
      const shallow = msg.shallow !== false;
      const maxDepth = (msg.maxDepth && Number(msg.maxDepth) > 0) ? Number(msg.maxDepth) : 4;
      const res = scanDirSmart(targetPath, msg.activeFilePath || '', shallow, maxDepth, 2500);
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
