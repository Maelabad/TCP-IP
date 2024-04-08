const { Server } = require('socket.io');
const server = new Server({ cors: { 'origin': 'http://192.168.1.11:4200' } });

const clientRaspberryMap = new Map();

server.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        clientRaspberryMap.set(socket.id, roomId);
        console.log(`Client ${socket.id} joined room ${roomId}`);
    });

    socket.on('message1', (data) => {
        console.log(data);
        const roomId = clientRaspberryMap.get(socket.id);
        console.log("Room associated with Raspberry Pi:", roomId);
        socket.to(roomId).emit('messageFromClient', data);
    });
    socket.on('message', (data) => {
        console.log(data);
        const roomId = clientRaspberryMap.get(socket.id);
        console.log("test1 Room associated with Raspberry Pi:", roomId);
        socket.to(roomId).emit('messageFromRaspberry', data);
    });

    socket.on('disconnect', () => {
        const roomId = clientRaspberryMap.get(socket.id);
        console.log(`Client ${socket.id} disconnected from room ${roomId}`);
        clientRaspberryMap.delete(socket.id);
    });
});

server.listen(4000);
