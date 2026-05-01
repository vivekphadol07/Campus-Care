const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const db = require("./config/db");
const initPlacementDB = require("./utils/initPlacementDB");
const initProfileDB = require("./utils/initProfileDB");

initPlacementDB();
initProfileDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Student Attendance System API");
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Attach io to app for use in routes
app.set("socketio", io);

// Routes (NO /api)
app.use("/api/students", require("./routes/students"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/teachers", require("./routes/teachers"));
app.use("/api/timetable", require("./routes/timetable"));
app.use("/api/mess", require("./routes/mess"));
app.use("/api/events", require("./routes/events"));
app.use("/api/placement", require("./routes/placement"));
app.use("/api/profile", require("./routes/profile"));


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

