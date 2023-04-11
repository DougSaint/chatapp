import express from "express";
import { createToken, verifyToken } from "./auth";
import { addMessage, dbPromise, getMessageHistory } from "./database/db";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const usernames: { [socketId: string]: string } = {};

const userSockets = new Map<string, any>();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", async (username: string) => {
    userSockets.set(username, socket);
    const messageHistory = await getMessageHistory();
    const history = messageHistory.map((item) => ({
      username: item.username,
      text: item.content,
      timestamp: item.timestamp,
    }));
    console.log(history);
    socket.emit("messageHistory", history);
    socket.emit("registered");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });

  socket.on("message", async (message: { text: string; username: string }) => {
    console.log("Received message:", message);
    const timestamp = Date.now();
    await addMessage(message.username, message.text, timestamp);
    socket.broadcast.emit("message", message);
  });

  socket.on("privateMessage", (data: { recipient: string; text: string }) => {
    console.log(
      "Private message from",
      socket.id,
      "to",
      data.recipient,
      ":",
      data.text
    );
    const recipientSocket = userSockets.get(data.recipient);
    const sender = usernames[socket.id];
    if (recipientSocket) {
      recipientSocket.emit("privateMessage", { sender, text: data.text });
    } else {
      console.log("Recipient not found:", data.recipient);
    }
  });
});

const PORT = process.env.PORT || 3000;

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send("Username and password are required");
    return;
  }

  const db = await dbPromise;
  try {
    const result = await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );
    if (result.lastID) {
      const payload = { id: result.lastID, username };
      const token = createToken(payload);
      res.status(201).send({ token });
    } else {
      res.status(500).send("Failed to create user");
    }
  } catch (err) {
    res.status(500).send("Failed to create user");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).send("Username and password are required");
    return;
  }

  const db = await dbPromise;
  const user = await db.get("SELECT * FROM users WHERE username = ?", [
    username,
  ]);

  if (user && user.password === password) {
    const payload = { id: user.id, username };
    const token = createToken(payload);
    res.send({ token });
  } else {
    res.status(401).send("Invalid username or password");
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
