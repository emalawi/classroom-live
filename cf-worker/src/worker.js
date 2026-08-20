export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Route WebSocket connections to the right Room (by meeting ID)
    if (url.pathname === "/ws") {
      const roomId = url.searchParams.get("roomId");
      if (!roomId) {
        return new Response("Missing roomId", { status: 400 });
      }
      const id = env.ROOMS.idFromName(roomId);
      const room = env.ROOMS.get(id);
      return room.fetch(request);
    }

    // Teacher uploads a PDF -> save to KV, keyed by roomId
    if (url.pathname === "/upload-pdf" && request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.roomId || !body.pdfData) {
          return new Response(JSON.stringify({ success: false, error: "Missing roomId or pdfData" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        await env.PDF_STORE.put(body.roomId, body.pdfData);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: "Invalid data" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Anyone fetches the currently stored PDF for a room
    if (url.pathname === "/get-pdf" && request.method === "GET") {
      const roomId = url.searchParams.get("roomId") || "";
      const pdfData = await env.PDF_STORE.get(roomId);
      return new Response(JSON.stringify({ pdfData: pdfData || null }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fallback response
    return new Response("Classroom Live server is running.", {
      headers: { "Content-Type": "text/plain" }
    });
  }
};

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = new Map(); // clientId -> { ws, role }
    this.teacherId = null;
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();
    this.handleSession(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  handleSession(ws) {
    const clientId = crypto.randomUUID();
    this.clients.set(clientId, { ws, role: null });

    ws.send(JSON.stringify({ type: "welcome", id: clientId }));

    ws.addEventListener("message", (event) => {
      this.handleMessage(clientId, event.data);
    });

    ws.addEventListener("close", () => {
      this.handleClose(clientId);
    });

    ws.addEventListener("error", () => {
      this.handleClose(clientId);
    });
  }

  handleMessage(clientId, raw) {
    let data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    const me = this.clients.get(clientId);
    if (!me) return;

    // --- Teacher hosts this room ---
    if (data.type === "host") {
      if (this.teacherId && this.teacherId !== clientId) {
        this.send(me.ws, { type: "error", message: "A teacher is already in this room." });
        return;
      }
      this.teacherId = clientId;
      me.role = "teacher";
      this.send(me.ws, { type: "hosted", roomId: data.roomId });
      return;
    }

    // --- Student joins this room ---
    if (data.type === "join-room") {
      if (!this.teacherId) {
        this.send(me.ws, { type: "error", message: "No meeting found with that ID." });
        return;
      }
      me.role = "student";
      this.send(me.ws, { type: "joined", roomId: data.roomId, teacherId: this.teacherId });

      const teacher = this.clients.get(this.teacherId);
      if (teacher) {
        this.send(teacher.ws, { type: "student-joined", id: clientId });
      }
      return;
    }

    // --- Targeted signaling (offer/answer/candidate) ---
    if (data.to) {
      const target = this.clients.get(data.to);
      if (target) {
        data.from = clientId;
        this.send(target.ws, data);
      }
      return;
    }

    // --- Broadcast messages (chat, pdf, poll) ---
    const broadcastTypes = ["chat", "pdf-ready", "pdf-page", "poll-new", "poll-results"];
    if (broadcastTypes.includes(data.type)) {
      if (me.role === "teacher") {
        this.broadcastToStudents(data, clientId);
      } else if (this.teacherId) {
        const teacher = this.clients.get(this.teacherId);
        if (teacher) this.send(teacher.ws, data);
      }
      return;
    }

    // --- Student poll votes go to the teacher for tallying ---
    if (data.type === "poll-vote") {
      if (this.teacherId) {
        const teacher = this.clients.get(this.teacherId);
        if (teacher) {
          data.from = clientId;
          this.send(teacher.ws, data);
        }
      }
      return;
    }
  }

  handleClose(clientId) {
    const me = this.clients.get(clientId);
    if (!me) return;

    if (clientId === this.teacherId) {
      // Teacher left - notify all students
      this.broadcastToStudents({ type: "teacher-left" }, null);
      this.teacherId = null;
    } else if (me.role === "student" && this.teacherId) {
      // Student left - notify the teacher so it can clean up that peer connection
      const teacher = this.clients.get(this.teacherId);
      if (teacher) {
        this.send(teacher.ws, { type: "student-left", id: clientId });
      }
    }

    this.clients.delete(clientId);
  }

  broadcastToStudents(obj, excludeId) {
    this.clients.forEach((client, id) => {
      if (client.role === "student" && id !== excludeId) {
        this.send(client.ws, obj);
      }
    });
  }

  send(ws, obj) {
    try {
      ws.send(JSON.stringify(obj));
    } catch (e) {
      // client likely disconnected
    }
  }
}
