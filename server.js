const net = require('net');

const clientMap = new Map();


// Fonction pour obtenir l'adresse IPv4 à partir de l'adresse IPv6
function getIPv4(ip) {
    if (ip.includes(':')) {
        // Si l'adresse contient des deux points, c'est une adresse IPv6
        const parts = ip.split(':');
        return parts[parts.length - 1]; // Renvoie la dernière partie (qui est l'adresse IPv4)
    }
    return ip; // Si c'est déjà une adresse IPv4, la renvoie telle quelle
}

const server = net.createServer((socket) => {
    console.log('Client TCP/IP connected:', `${getIPv4(socket.remoteAddress)}:${socket.remotePort}`);


    socket.on('data', (data) => {
        const message = data.toString(); // Convertir les données en chaîne
        const parts = message.split(';'); // Supposons que les données sont séparées par des ';'

        console.log(parts);

        if (parts.length == 2) {
            firstConnection( socket, parts);
            console.log(clientMap);
        } else {
            console.log('On a recu des données.');
            // Ajouter une fonction pour gerer les messages ordinaires
        }
    });

    socket.on('end', () => {
        console.log('Client TCP/IP disconnected:', `${getIPv4(socket.remoteAddress)}:${socket.remotePort}`);
        // Supprimer l'entrée associée dans le clientMap lors de la déconnexion du client
        clientMap.forEach((value, key) => {
            if (value === socket.remoteAddress) {
                clientMap.delete(key);
            }
        });
    });

    socket.on('error', (err) => {
        console.error('Client TCP/IP connection error:', err);
    });
});



function firstConnection(socket, list) {
    const imei = list[0]; // Supposons que le premier élément est l'IMEI
    const ipAddress = list[1]; // Supposons que le deuxième élément est l'adresse IP

    // Associer l'IMEI avec l'adresse IP dans le dictionnaire clientMap
    clientMap.set(imei, ipAddress);
    console.log(`IMEI ${imei} associated with IP address ${ipAddress}`);
    // Envoyer un accusé de réception au client
    socket.write('OK');
}




server.listen(5000, () => {
    console.log('Server TCP/IP listening on port 5000');
});
