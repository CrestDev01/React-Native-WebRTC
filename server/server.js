const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from a .env file
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/dbConfig"); // Importing database connection function
const router = require("./routes"); // Importing router/controller
const app = express();
const server = http.createServer(app);
const path = require("path");

// Middleware to parse incoming request bodies as JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use('/public',express.static(path.join(__dirname, "public")));

// Route middleware to handle API endpoints
app.use("/api/v1", router);

// Default route handling
app.get("/", (req, res) => {
  res.send("WebRTC Signaling Server");
});

// Setting up Socket.IO with CORS configuration
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow requests from any origin (you might want to restrict this in production)
    methods: ["GET", "POST"], // Allow GET and POST requests
    allowedHeaders: ["my-custom-header"], // Allow custom headers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
});

const roomUsers = {};
const connectedUsers = {};
const connectedClients = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  connectedClients[socket.id] = socket;
  // console.log('a user connected connectedClients', connectedClients);
  // Emit the list of connected client IDs to the client
  emitConnectedClients();
  socket.on('get-connected-clients', () => {
    emitConnectedClients();
  })

  socket.on("user_data", (userData) => {
    connectedUsers[userData._id] = {
      data: userData,
      socketId: socket.id,
    };
  });

  socket.on("offer", (data) => {
    const {offer,userData:fromUser,toUser}=data
    console.log("FROMUSER",fromUser)
    const targetSocket = connectedUsers[toUser._id];
    if (targetSocket) {
      const SocketData = connectedClients[targetSocket.socketId];
      if (SocketData) {
        SocketData.emit("offer", { offer, fromUser, toUser });
      } else {
        console.log(`Target user ${toUser._id} is not connected`);
      }
    } else {
      console.log(`Target user ${toUser._id} is not connected`);
    }
  });

  // socket.on('offer', (offer) => {
  //   console.log('offer', offer);
  //   socket.broadcast.emit('offer', offer);
  // });

  socket.on('answer', (answerdata) => {
    console.log("JUJU",answerdata)
    const { answer, userData,  incomingOfferFrom } = answerdata;
    const targetSocket = connectedUsers[incomingOfferFrom._id];
    if (targetSocket) {
       const SocketData = connectedClients[targetSocket.socketId];
    if (SocketData) {
       SocketData.emit('answer', { answer, userData, incomingOfferFrom });
    } else {
       console.log(`Target user ${incomingOfferFrom._id} is not connected`);
    }
  } else {
    console.log(`Target user ${incomingOfferFrom._id} is not connected`);
  }
  });

  socket.on('candidate', (candidate) => {
    socket.broadcast.emit('candidate', candidate);
  });
  
  socket.on('is-mute', (candidate) => {
    socket.broadcast.emit('is-mute', candidate);
  });

  socket.on('is-cam-on', (candidate) => {
    socket.broadcast.emit('is-cam-on', candidate);
  });

  socket.on('end-call', () => {
    console.log('end-call');
    socket.broadcast.emit('end-call');
  });



  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    for (const id in connectedClients) {
      if (id == socket.id) {
        delete connectedClients[socket.id];
      }
    }
    for (const room in roomUsers) {
      if (roomUsers[room].has(socket.id)) {
        roomUsers[room].delete(socket.id);
        io.to(room).emit('room-users', Array.from(roomUsers[room]));
      }
    }
    // You might want to handle any cleanup related to the disconnected user here
  });

  //Room
  socket.on('room-join', (data) => {
    console.log(`User ${socket.id} joined room ${data.room}`);
    socket.join(data.room);
    // Add user to roomUsers object
    if (!roomUsers[data.room]) {
      roomUsers[data.room] = new Set();
    }
    roomUsers[data.room].add(socket.id);
    // Emit updated user list to all clients in the room
    io.to(data.room).emit('room-users', Array.from(roomUsers[data.room]));
  });

  socket.on('room-offer', (offer) => {
    console.log('room-offer', offer);
    socket.broadcast.emit('room-offer', offer);
  });

  socket.on('room-answer', (answer) => {
    console.log('room-answer', answer);
    socket.broadcast.emit('room-answer', answer);
  });

  socket.on('room-candidate', (candidate) => {
    console.log('room-candidate', candidate);
    socket.broadcast.emit('room-candidate', candidate);
  });

  socket.on('room-end-call', () => {
    console.log('room-end-call');
    socket.broadcast.emit('room-end-call');
  });

  //Group
  socket.on('group-offer', ({ room, offer }) => {
    console.log('group-offer', offer);
    socket.to(room).emit('group-offer', { offer, socketId: socket.id });
  });

  socket.on('group-answer', ({ room, answer, offerSocketId }) => {
    console.log('group-answer', answer);
    io.to(offerSocketId).emit('group-answer', { answer, socketId: socket.id });
  });

  socket.on('group-candidate', ({ room, candidate }) => {
    console.log('group-candidate', candidate);
    socket.to(room).emit('group-candidate', { candidate, socketId: socket.id });
  });

  socket.on('group-end-call', (room) => {
    console.log('group-end-call');
    socket.to(room).emit('group-end-call');
  });

  socket.on('group-room-join', (room) => {
    console.log(`User ${socket.id} joined room ${room}`);
    socket.join(room);
    if (!roomUsers[room]) {
      roomUsers[room] = new Set();
    }
    roomUsers[room].add(socket.id);
    io.to(room).emit('group-room-users', Array.from(roomUsers[room]));
  });
});

function emitConnectedClients() {
  const connectedClientIds = Object.keys(connectedClients);
  io.emit('connected-clients', connectedClientIds);
}

// Server setup and initialization
const PORT = process.env.PORT; // Fetching port number from environment variables
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB(); // Establishing database connection
});
