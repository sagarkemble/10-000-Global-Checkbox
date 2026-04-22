import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});
app.use(express.static("public"));

try {
  httpServer.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
}

const checkBoxArr = new Array(10000).fill(false);
let connectedUser = 0;

io.on("connection", (socket) => {
  connectedUser++;
  socket.emit("onConnect", checkBoxArr);
  io.emit("userCount", connectedUser);
  socket.on("checkboxChange", (data) => {
    checkBoxArr[Number(data.index)] = data.state;
    socket.broadcast.emit("checkboxChange", data);
  });
  socket.on("disconnect", () => {
    connectedUser--;
    io.emit("userCount", connectedUser);
  });
});
