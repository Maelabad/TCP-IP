const net = require('net');

const raspberryMap = new Map();
const raspberrySocket = new Map();

const clientMap = new Map();
const clientSocket = new Map();


const server = net.createServer((socket) => {
    console.log('Client TCP/IP connected:', `${socket.remoteAddress}:${socket.remotePort}`);

    

    socket.on('data', (data) => {
        const message = data.toString(); // Convertir les données en chaîne
        const parts = message.split(' - '); // Supposons que les données sont séparées par des ' - '

        console.log(parts);

        if (parts[0] == "0") { // c'est un raspberry qui s'est connectée raspberry
            raspberrySocket.set(parts[1], socket);
            raspberryConnected(socket, parts, message);
        }
        else {
            clientSocket.set(parts[1], socket);
            clientConnected(socket, parts, message);
        }

    });

    socket.on('end', () => {
        console.log('Client TCP/IP disconnected:', `${socket.remoteAddress}:${socket.remotePort}`);
        // Supprimer l'entrée associée dans le raspberryMap lors de la déconnexion du client
        raspberryMap.forEach((value, key) => {
            if (value === socket.remoteAddress) {
                raspberryMap.delete(key);
                
            }
        });
    });

    socket.on('error', (err) => {
        console.error('Client TCP/IP connection error:', err);
    });
});

function raspberryConnected(socket, list, message) {

    if (list.length == 2) {
        firstConnection( socket, list, raspberryMap);
        console.log(raspberryMap);
    } else {
        console.log('On a recu des données.');

        send_data_to_client(list, message);

        // Ajouter une fonction pour gerer les messages ordinaires
    } 
}


function clientConnected(socket, list, message) {

    if (list.length == 2) {
        imei = firstConnection( socket, list, clientMap);
        console.log(clientMap);
    } else {
        console.log('On a recu des données.');
        check_and_send_data(list, message);
        
        // Ajouter une fonction pour gerer les messages ordinaires
    } 
}


function firstConnection(socket, list, map) {
    const imei = list[1]; // Supposons que le premier élément est l'IMEI
    const ipAddress = list[2]; // Supposons que le deuxième élément est l'adresse IP

    // Associer l'IMEI avec l'adresse IP dans le dictionnaire raspberryMap
    map.set(imei, ipAddress);
    console.log(`IMEI ${imei} associated with IP address ${ipAddress}`);
    // Envoyer un accusé de réception au client
    socket.write('OK');
}



function check_and_send_data(list, message) {
    imei = list[1];


    raspberrySocket.forEach((value, key) => {
        if (key === imei) {
            console.log("On envoie des données au DM");
            value.write(message);
        }
    });    
}


function send_data_to_client(list, message) {
    imei = list[1]
    clientSocket.forEach((value, key) => {
        if (key === imei) {

            value.write(message);
        }
    });    
}


server.listen(5000, () => {
    console.log('Server TCP/IP listening on port 5000');
});
