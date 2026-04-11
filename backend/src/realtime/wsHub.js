import jwt from "jsonwebtoken";
import { WebSocket, WebSocketServer } from "ws";

const jwtSecret = process.env.JWT_SECRET || "dev-nba-jwt-secret";
const clientsByUserId = new Map();
let wss;
let heartbeatTimer;

function parseUserFromRequest(request) {
  const url = new URL(request.url, "http://localhost");
  const token = url.searchParams.get("token");
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    return payload?.sub ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

function addClient(userId, ws) {
  const userKey = String(userId);
  const set = clientsByUserId.get(userKey) || new Set();
  set.add(ws);
  clientsByUserId.set(userKey, set);
}

function removeClient(userId, ws) {
  const userKey = String(userId);
  const set = clientsByUserId.get(userKey);
  if (!set) {
    return;
  }
  set.delete(ws);
  if (!set.size) {
    clientsByUserId.delete(userKey);
  }
}

export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, request) => {
    const userId = parseUserFromRequest(request);
    if (!userId) {
      ws.close(1008, "Unauthorized");
      return;
    }

    ws.userId = userId;
    ws.isAlive = true;
    addClient(userId, ws);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      removeClient(userId, ws);
    });

    ws.on("error", () => {
      removeClient(userId, ws);
    });
  });

  heartbeatTimer = setInterval(() => {
    if (!wss) {
      return;
    }

    wss.clients.forEach((ws) => {
      if (!ws.isAlive) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
}

export function emitToUser(userId, event, payload) {
  const set = clientsByUserId.get(String(userId));
  if (!set || !set.size) {
    return;
  }

  const message = JSON.stringify({ event, payload });
  set.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

export function closeWebSocket() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
  if (wss) {
    wss.close();
  }
}
