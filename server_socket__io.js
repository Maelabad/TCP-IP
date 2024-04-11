const { Server } = require('socket.io');
const net = require('net');

const socketIOServer = new Server({ cors: { 'origin': 'http://localhost:4200' } });
const tcpServer = net.createServer();

const raspberrySocket = new Map();
const clientSocket = new Map();

// Gestion des connexions TCP/IP
tcpServer.on('connection', (socket) => {
    console.log('Client TCP/IP connected:', `${socket.remoteAddress}:${socket.remotePort}`);

    socket.on('data', (data) => {
        const message = data.toString(); // Convertir les données en chaîne
        const parts = message.split('-'); // Supposons que les données sont séparées par '-'

        if (parts.length !== 2) {
            console.log("Format de message invalide pour le Raspberry:", message);
            return;
        }

        const imei = parts[0].trim();
        const content = parts[1].trim();

        if (!raspberrySocket.has(imei)) {
            console.log(`IMEI inconnu pour le Raspberry: ${imei}`);
            return;
        }

        const client = raspberrySocket.get(imei);
        client.write(content);
    });

    socket.on('end', () => {
        console.log('Client TCP/IP disconnected:', `${socket.remoteAddress}:${socket.remotePort}`);
        // Supprimer l'entrée associée dans le raspberrySocket lors de la déconnexion du client
        raspberrySocket.forEach((value, key) => {
            if (value === socket) {
                raspberrySocket.delete(key);
                console.log(`Raspberry déconnecté: ${key}`);
            }
        });
    });

    socket.on('error', (err) => {
        console.error('Client TCP/IP connection error:', err);
    });
});


// Gestion des connexions Socket.IO
socketIOServer.on('connection', (socket) => {
    console.log('Un client s\'est connecté via Socket.IO');

    socket.on('data', (data) => {
        console.log('Message reçu via Socket.IO:', data);
        const parts = data.split('-');

        if (parts.length !== 2) {
            console.log("Format de message invalide pour le client:", data);
            return;
        }

        const imei = parts[0].trim();
        const content = parts[1].trim();

        if (!clientSocket.has(imei)) {
            console.log(`IMEI inconnu pour le client: ${imei}`);
            return;
        }

        const raspberry = clientSocket.get(imei);
        raspberry.write(content);
    });

    socket.on('disconnect', () => {
        console.log('Un client s\'est déconnecté via Socket.IO');
        // Supprimer l'entrée associée dans le clientSocket lors de la déconnexion du client
        clientSocket.forEach((value, key) => {
            if (value === socket) {
                clientSocket.delete(key);
                console.log(`Client déconnecté: ${key}`);
            }
        });
    });
});

// Démarrer les serveurs
const PORT = process.env.PORT || 5000;
tcpServer.listen(PORT, () => {
    console.log(`Serveur fusionné démarré sur le port ${PORT}`);
});

socketIOServer.listen(PORT, () => {
    console.log(`Serveur Socket.IO démarré sur le port ${PORT}`);
});
