const net = require('net');

const raspberrySocket = new Map();

const clientSocket = new Map();




const server = net.createServer((socket) => {
    console.log('Client TCP/IP connected:', `${socket.remoteAddress}:${socket.remotePort}`);

    
    socket.on('data', (data) => {
        const message = data.toString(); // Convertir les données en chaîne
        const parts = message.split(' - '); // Supposons que les données sont séparées par des ' - '

        // Afficher ce qui est recu
        console.log(parts);

        if (parts[0] == "0") { // c'est un raspberry qui s'est connectée raspberry
            raspberrySocket.set(parts[1], socket);
            raspberryConnected(socket, parts, message);
        }
        else if (parts[0] == "1") {
            clientSocket.set(parts[1], socket);
            clientConnected(socket, parts, message);
        }
        else {
            console.error("On n'arrive pas a identifier l'auteur de ce message "+message);
        }

    });

    socket.on('end', () => {
        console.log('Client TCP/IP disconnected:', `${socket.remoteAddress}:${socket.remotePort}`);


    });

    socket.on('error', (err) => {
        console.error('Client TCP/IP connection error:', err);
        removeDisconnectedSockets(raspberrySocket, clientSocket);
    });
});


function removeDisconnectedSockets(map1, map2, disconnectedSocket) {
    // Parcours de la première map
    for (const [key, socket] of map1.entries()) {
        // Si le socket correspond au socket déconnecté
        if (socket === disconnectedSocket) {
            // Supprimer l'entrée correspondante de la première map
            map1.delete(key);
            console.log(`Socket déconnecté trouvé dans map1. Clé: ${key}`);
            break; // Sortir de la boucle dès que le socket déconnecté est trouvé
        }
    }

    // Parcours de la deuxième map
    for (const [key, socket] of map2.entries()) {
        // Si le socket correspond au socket déconnecté
        if (socket === disconnectedSocket) {
            // Supprimer l'entrée correspondante de la deuxième map
            map2.delete(key);
            console.log(`Socket déconnecté trouvé dans map2. Clé: ${key}`);
            // Vous pouvez choisir de sortir de la boucle ici ou continuer à parcourir
            // break; 
        }
    }
}


function getMessage(message) {
    let final_message = message.split(" - ").slice(2).join(" - ");
    return final_message;
}

function raspberryConnected(socket, list, message) {

    if (list.length == 2) {
        socket.write('OK'); // Ack for the first conn
    } else {
        console.log('On a recu des données du raspberryPi');
        send_data_to_client(list, message);
    } 
}


function clientConnected(socket, list, message) {

    if (list.length == 2) {
        socket.write('OK'); // Ack for the first connexion
    } else {
        console.log('On a recu des données du client');
        send_data_to_raspberry(list, message);
    } 
}


function send_data_to_raspberry(list, message) {
    imei = list[1];

    //Parcourons le map pour verifier si l'imei est associé a un socket
    raspberrySocket.forEach((value, key) => {
        if (key === imei) {
            console.log(`On envoie des données du client ${imei} au DM`);
            value.write(getMessage(message));
        }
    });    
}

function send_data_to_client(list, message) {
    imei = list[1]
    //Parcourons le map pour verifier si l'imei est associé a un socket
    clientSocket.forEach((value, key) => { 
        if (key === imei) {
            console.log(`On envoie des données du DM ${imei} au client`);
            value.write(message);
        }
    });    
}

server.listen(5000, () => {
    console.log('Server TCP/IP listening on port 5000');
});