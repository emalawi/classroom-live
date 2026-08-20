const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const WebSocket = require('ws');

const PDF_STORAGE_FILE = path.join(__dirname, 'pdf-storage.json');

// Structure: { "Malawi": { pdfData: "..." }, "OtherRoom": { pdfData: null } }
if (!fs.existsSync(PDF_STORAGE_FILE)) {
  fs.writeFileSync(PDF_STORAGE_FILE, JSON.stringify({}));
}

function readPdfStore() {
  try { return JSON.parse(fs.readFileSync(PDF_STORAGE_FILE)); } catch (e) { return {}; }
}
function writePdfStore(store) {
  fs.writeFileSync(PDF_STORAGE_FILE, JSON.stringify(store));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(500); res.end('Error loading index.html'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // POST /upload-pdf  { roomId, pdfData }
  if (req.method === 'POST' && req.url === '/upload-pdf') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const store = readPdfStore();
        store[parsed.roomId] = { pdfData: parsed.pdfData };
        writePdfStore(store);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid data' }));
      }
    });
    return;
  }

  // GET /get-pdf?roomId=Malawi
  if (req.method === 'GET' && req.url.startsWith('/get-pdf')) {
    const urlObj = new URL(req.url, 'http://localhost');
    const roomId = urlObj.searchParams.get('roomId') || '';
    const store = readPdfStore();
    const entry = store[roomId] || { pdfData: null };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(entry));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocket.Server({ server });

// clientId -> { ws, role, roomId }
const clients = new Map();
// roomId -> { teacherId, studentIds: Set }
const rooms = new Map();

function send(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

function broadcastToStudents(roomId, obj, excludeId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.studentIds.forEach((studentId) => {
    if (studentId !== excludeId) {
      const c = clients.get(studentId);
      if (c) send(c.ws, obj);
    }
  });
}

wss.on('connection', (ws) => {
  const clientId = crypto.randomUUID();
  clients.set(clientId, { ws, role: null, roomId: null });
  console.log('New connection:', clientId);

  send(ws, { type: 'welcome', id: clientId });

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw.toString()); } catch (e) { return; }
    const me = clients.get(clientId);
    if (!me) return;

    // --- Teacher creates/hosts a room ---
    if (data.type === 'host') {
      const roomId = (data.roomId || '').trim();
      if (!roomId) { send(ws, { type: 'error', message: 'Meeting ID required.' }); return; }

      if (rooms.has(roomId) && rooms.get(roomId).teacherId) {
        send(ws, { type: 'error', message: 'That Meeting ID is already in use.' });
        return;
      }

      rooms.set(roomId, { teacherId: clientId, studentIds: new Set() });
      me.role = 'teacher';
      me.roomId = roomId;
      send(ws, { type: 'hosted', roomId: roomId });
      return;
    }

    // --- Student joins a room by ID ---
    if (data.type === 'join-room') {
      const roomId = (data.roomId || '').trim();
      const room = rooms.get(roomId);

      if (!room || !room.teacherId) {
        send(ws, { type: 'error', message: 'No meeting found with that ID.' });
        return;
      }

      me.role = 'student';
      me.roomId = roomId;
      room.studentIds.add(clientId);

      send(ws, { type: 'joined', roomId: roomId, teacherId: room.teacherId });
      send(clients.get(room.teacherId).ws, { type: 'student-joined', id: clientId });
      return;
    }

    // --- Targeted signaling (offer/answer/candidate) ---
    if (data.to) {
      const target = clients.get(data.to);
      if (target) {
        data.from = clientId;
        send(target.ws, data);
      }
      return;
    }

    // --- Broadcast messages scoped to the sender's room ---
    if (data.type === 'chat' || data.type === 'pdf-ready' || data.type === 'pdf-page' || data.type === 'poll-new' || data.type === 'poll-results') {
      if (!me.roomId) return;
      if (me.role === 'teacher') {
        broadcastToStudents(me.roomId, data, clientId);
      } else {
        const room = rooms.get(me.roomId);
        if (room && room.teacherId) send(clients.get(room.teacherId).ws, data);
      }
      return;
    }

    if (data.type === 'poll-vote') {
      if (!me.roomId) return;
      const room = rooms.get(me.roomId);
      if (room && room.teacherId) {
        data.from = clientId;
        send(clients.get(room.teacherId).ws, data);
      }
      return;
    }
  });

  ws.on('close', () => {
    console.log('Disconnected:', clientId);
    const me = clients.get(clientId);
    if (me && me.roomId) {
      const room = rooms.get(me.roomId);
      if (room) {
        if (me.role === 'teacher') {
          broadcastToStudents(me.roomId, { type: 'teacher-left' }, null);
          rooms.delete(me.roomId);
        } else {
          room.studentIds.delete(clientId);
          if (room.teacherId) {
            send(clients.get(room.teacherId).ws, { type: 'student-left', id: clientId });
          }
        }
      }
    }
    clients.delete(clientId);
  });
});

server.listen(8080, () => {
  console.log('Server running on port 8080 (HTTP + WebSocket)');
});
