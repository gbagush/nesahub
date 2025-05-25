require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { clerkMiddleware } = require("@clerk/express");

const authenticateSocket = require("./lib/clerk");
const { ALLOWED_RELAY_EVENTS, ALLOWED_WEBHOOK_EVENTS } = require("./config");
const { log } = require("./lib/utils");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(clerkMiddleware());
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "*" },
});

const connectedUsers = new Map();

io.use(authenticateSocket);

io.on("connection", (socket) => {
  const { userId, sessionId } = socket.auth;
  connectedUsers.set(socket.id, { userId, sessionId, socketId: socket.id });

  log(`🚀 Connected: ${userId} (${socket.id})`);
  log(`👥 Active Connections: ${connectedUsers.size}`);

  socket.onAny((event, payload) => {
    if (!ALLOWED_RELAY_EVENTS.includes(event)) return;

    const { userId: targetUserId, data } = payload;
    const senderId = socket.auth.userId;

    for (const [socketId, user] of connectedUsers.entries()) {
      if (user.userId === targetUserId && socketId !== socket.id) {
        const targetSocket = io.sockets.sockets.get(socketId);
        if (targetSocket) {
          targetSocket.emit(event, {
            from: senderId,
            data,
          });
        }
      }
    }
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    log(`❌ Disconnected: ${userId} (${socket.id})`);
    log(`👥 Active Connections: ${connectedUsers.size}`);
  });
});

app.post("/webhook", (req, res) => {
  const { secret, userId, event, data } = req.body;

  if (!secret || !userId || !event || !data) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const EXPECTED_SECRET = process.env.WEBHOOK_SECRET;

  if (!EXPECTED_SECRET || secret !== EXPECTED_SECRET) {
    return res.status(403).json({ error: "Invalid or missing secret" });
  }

  if (!ALLOWED_WEBHOOK_EVENTS.includes(event)) {
    return res.status(403).json({
      error: `Event '${event}' is not allowed via webhook.`,
    });
  }

  const targets = [];

  for (const [socketId, user] of connectedUsers.entries()) {
    if (user.userId === userId) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        targets.push(socket);
      }
    }
  }

  if (targets) {
    targets.forEach((socket) => {
      socket.emit(event, data);
    });
    return res.json({ success: true, message: "Message sent" });
  } else {
    return res.json({ message: `User ${userId} not connected` });
  }
});

server.listen(PORT, () => {
  log(`✅ Server running at http://localhost:${PORT}`);
});
