function registerSocketHandlers(io) {
    const rooms = new Map();

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        let currentRoomId = null;

        socket.on('join-room', (roomId) => {
            if (currentRoomId) {
                socket.leave(currentRoomId);
                const prevRoom = rooms.get(currentRoomId);
                if (prevRoom) {
                    prevRoom.delete(socket.id);
                    socket.to(currentRoomId).emit('user-disconnected', socket.id);
                }
            }
            
            console.log(`📥 ${socket.id} joining room ${roomId}`);
            currentRoomId = roomId;
            socket.join(roomId);

            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            const room = rooms.get(roomId);
            
            // SIMPLE LOGIC: First user = doctor, others = patients
            const isFirstUser = room.size === 0;
            const userRole = isFirstUser ? "doctor" : "patient";
            
            console.log(`👤 ${socket.id} role: ${userRole} (room had ${room.size} users)`);

            // Send existing users to new user
            const existingUsers = Array.from(room);
            socket.emit('all-users', existingUsers);

            // Add user to room
            room.add(socket.id);
            
            // Tell new user their role
            socket.emit('user-role', { role: userRole, isFirst: isFirstUser });
            
            // Notify others about new user
            socket.to(roomId).emit('user-joined', socket.id);

            console.log(`Room ${roomId} has ${room.size} participants`);
        });

        socket.on('signal', ({ to, data }) => {
            io.to(to).emit('signal', { from: socket.id, data });
        });
        
        const handleDisconnect = () => {
            console.log(`❌ ${socket.id} disconnected`);
            if (currentRoomId) {
                const room = rooms.get(currentRoomId);
                if (room) {
                    room.delete(socket.id);
                    socket.to(currentRoomId).emit('user-disconnected', socket.id);
                    
                    if (room.size === 0) {
                        console.log(`🗑️ Deleting empty room: ${currentRoomId}`);
                        rooms.delete(currentRoomId);
                    }
                }
            }
        };

        socket.on('disconnect', handleDisconnect);
        socket.on('leave-room', handleDisconnect);
    });
}

module.exports = registerSocketHandlers;
