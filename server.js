const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const WebSocket = require('ws');

const HOST = '0.0.0.0';
const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const CAPTURES = path.join(ROOT, 'captures');
fs.mkdirSync(CAPTURES, { recursive: true });

// In-memory session store
const onlineSessions = new Map(); // sessionId -> { hostId, participants: Map, frames: [], status, hostFrames: [] }

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function safePath(base, requestPath) {
  const clean = decodeURIComponent(requestPath.split('?')[0]);
  const resolved = path.resolve(base, `.${clean}`);
  return resolved.startsWith(path.resolve(base)) ? resolved : null;
}

function listCaptures() {
  return fs.readdirSync(CAPTURES)
    .filter((name) => /\.(jpg|jpeg|png)$/i.test(name))
    .map((name) => {
      const stat = fs.statSync(path.join(CAPTURES, name));
      return {
        name,
        url: `/captures/${encodeURIComponent(name)}`,
        size: stat.size,
        createdAt: stat.birthtime.toISOString()
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 25_000_000) req.destroy();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function broadcast(sessionId, message, excludeWs = null) {
  const session = onlineSessions.get(sessionId);
  if (!session) return;
  session.participants.forEach((ws, id) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('session');
  const participantId = url.searchParams.get('pid') || crypto.randomBytes(4).toString('hex');

  if (!sessionId) { ws.close(4000, 'Missing session'); return; }

  let session = onlineSessions.get(sessionId);
  if (!session) {
    session = { hostId: null, participants: new Map(), frames: [], status: 'waiting', hostFrames: [] };
    onlineSessions.set(sessionId, session);
  }

  session.participants.set(participantId, ws);

  ws.on('message', async (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    
    if (msg.type === 'host-ready') {
      session.hostId = participantId;
      session.status = 'ready';
      broadcast(sessionId, { type: 'status', status: 'ready' });
    }

    if (msg.type === 'start-countdown') {
      if (session.hostId !== participantId) return;
      session.status = 'countdown';
      broadcast(sessionId, { type: 'countdown', state: 'start', poseIndex: msg.poseIndex || 0 });
      for (let i = 3; i >= 1; i--) {
        await new Promise(r => setTimeout(r, 1000));
        broadcast(sessionId, { type: 'countdown', state: 'tick', seconds: i, poseIndex: msg.poseIndex });
      }
      broadcast(sessionId, { type: 'countdown', state: 'flash', poseIndex: msg.poseIndex });
    }

    if (msg.type === 'photo') {
      session.frames.push({
        participantId,
        dataUrl: msg.dataUrl,
        poseIndex: msg.poseIndex,
        timestamp: Date.now(),
        role: msg.role || 'participant'
      });
      broadcast(sessionId, { type: 'photo-received', participantId, poseIndex: msg.poseIndex });
    }
  });

  ws.on('close', () => {
    session.participants.delete(participantId);
    if (session.participants.size === 0) {
      onlineSessions.delete(sessionId);
    } else if (session.hostId === participantId) {
      const next = session.participants.keys().next().value;
      if (next) session.hostId = next;
    }
  });
});

async function handleRequest(req, res) {
  try {
    if (req.method === 'GET' && req.url === '/api/captures') {
      return json(res, 200, { captures: listCaptures() });
    }
    if (req.method === 'POST' && req.url === '/api/captures') {
      const body = JSON.parse(await readBody(req));
      if (typeof body.dataUrl !== 'string' || !/^data:image\/(jpeg|png);base64,/.test(body.dataUrl)) {
        return json(res, 400, { error: 'Format foto tidak valid' });
      }
      const [, encoded] = body.dataUrl.split(',', 2);
      const ext = body.dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
      const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(CAPTURES, filename), Buffer.from(encoded, 'base64'));
      return json(res, 201, { capture: { name: filename, url: `/captures/${encodeURIComponent(filename)}` } });
    }
    if (req.method === 'GET' && req.url.startsWith('/captures/')) {
      const file = safePath(CAPTURES, req.url.replace('/captures/', '/'));
      if (!file || !fs.existsSync(file)) return json(res, 404, { error: 'Foto tidak ditemukan' });
      res.writeHead(200, {
        'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      return fs.createReadStream(file).pipe(res);
    }
    // Online session APIs
    if (req.method === 'POST' && req.url === '/api/sessions') {
      const id = crypto.randomBytes(6).toString('hex');
      onlineSessions.set(id, { hostId: null, participants: new Map(), frames: [], status: 'waiting', hostFrames: [] });
      const link = `/online?session=${id}`;
      return json(res, 201, { sessionId: id, host: true, link });
    }
    if (req.method === 'GET' && req.url.startsWith('/api/sessions/')) {
      const id = req.url.split('/').pop();
      const session = onlineSessions.get(id);
      if (!session) return json(res, 404, { error: 'Session tidak ditemukan' });
      return json(res, 200, {
        sessionId: id,
        status: session.status,
        participants: session.participants.size,
        frames: session.frames.length,
        hostId: session.hostId
      });
    }
    if (req.method === 'POST' && req.url === '/api/online-photo') {
      const body = JSON.parse(await readBody(req));
      const sessionId = body.sessionId;
      const session = onlineSessions.get(sessionId);
      if (!session) return json(res, 404, { error: 'Session tidak ditemukan' });
      session.frames.push({
        participantId: body.hostId || 'host',
        dataUrl: body.dataUrl,
        poseIndex: body.poseIndex,
        timestamp: Date.now(),
        role: 'host'
      });
      broadcast(sessionId, { type: 'photo-received', participantId: 'host', poseIndex: body.poseIndex });
      return json(res, 200, { ok: true });
    }
    const requested = req.url === '/' ? '/index.html' : req.url;
    const file = safePath(PUBLIC, requested);
    if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      return json(res, 404, { error: 'Halaman tidak ditemukan' });
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    console.error(error);
    json(res, 500, { error: 'Terjadi kesalahan server' });
  }
}

// Create HTTP server and capture reference for upgrade
const httpServer = http.createServer(handleRequest);
httpServer.listen(HTTP_PORT, HOST, () => {
  console.log(`HTTP server aktif: http://localhost:${HTTP_PORT}`);
});

httpServer.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/online') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

// HTTPS
const keyPath = path.join(ROOT, 'key.pem');
const certPath = path.join(ROOT, 'cert.pem');
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };
  https.createServer(options, handleRequest).listen(HTTPS_PORT, HOST, () => {
    console.log(`HTTPS server aktif: https://localhost:${HTTPS_PORT}`);
  });
}
