const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const registerSocketHandlers = require('./socket');
require('dotenv').config();

const app = express();

// Remove specific allowedOrigins array

// Use CORS middleware to allow all origins (Access-Control-Allow-Origin: *)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: false, // Cannot use credentials with wildcard origin
}));

// For Socket.IO, allow all origins explicitly
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
  pingTimeout: 60000,
  transports: ['polling', 'websocket'],
});

io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);
});

registerSocketHandlers(io);

app.get('/', (req, res) => {
  res.send('Video Call Server is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    connections: io.engine.clientsCount,
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
