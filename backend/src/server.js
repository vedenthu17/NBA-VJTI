import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { initWebSocket } from "./realtime/wsHub.js";

dotenv.config();

const port = Number(process.env.API_PORT || process.env.PORT || 5001);
const server = http.createServer(app);
initWebSocket(server);

server.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
