import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import entryRoutes from "./routes/entryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import publicationRoutes from "./routes/publicationRoutes.js";
import fdpRoutes from "./routes/fdpRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import achievementRoutes from "./routes/achievementRoutes.js";

const app = express();

app.disable("etag");

app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "nba-faculty-backend" });
});

app.use("/auth", authRoutes);
app.use("/faculty", facultyRoutes);
app.use("/publications", publicationRoutes);
app.use("/fdp", fdpRoutes);
app.use("/projects", projectRoutes);
app.use("/entries", entryRoutes);
app.use("/admin", adminRoutes);
app.use("/reports", reportRoutes);
app.use("/notifications", notificationRoutes);
app.use("/achievements", achievementRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
