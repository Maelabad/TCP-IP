const io = require('socket.io-client');
//const serverAddress = 'http://52.202.11.194:6000';

let socket = null;

function initializeSocketIO(serverAddress) {
  socket = io.connect(serverAddress);
}

function closeSocketIO() {
  if (socket) {
    socket.close();
    console.log('Socket.IO connection closed');
    socket = null;
  } else {
    console.warn('Socket.IO connection is not initialized');
  }
}




exports = async function(){
  // Find the name of the MongoDB service you want to use
  const serviceName = "mongodb-atlas";

  // Update these to reflect your db/collection
  const dbName = "automatisation";
  const collName = "col1";

  // Get a collection from the context
  const collection = context.services.get(serviceName).db(dbName).collection(collName);
  //await sendSocketIOEvent("Let start", 'start');


  try {
    // Find documents where start_time is reached and automatic is true
    const startDocuments = await collection.find({ debut: { $lte: new Date() }, automatic: true }).toArray();
    
    
    
    initializeSocketIO('http://18.233.10.144:3300');

    // Send POST request for each document where start_time is reached and automatic is true
    for (const doc of startDocuments) {
      if (isWithinOneMinute(doc.start_time)) {
        //await sendSocketIOEvent(doc, 'start');
        await sendSocketIOEvent(sendMessage(doc, true));
        // On ajoute le champ nb jour aux documents
        await updateDocument(collection, doc._id, { debut: addDays(doc.debut, 1) }); // Ajouter 1 jour à la start_time
        
      }
    }
    
    // Find documents where end_time is reached and automatic is true
    const endDocuments = await collection.find({ fin: { $lte: new Date() }, automatic: true }).toArray();
    console.log(endDocuments);
    
      
      
      
    // Send POST request for each document where end_time is reached and automatic is true
    
    for (const doc of endDocuments) {
      if (isWithinOneMinute(doc.end_time)) {
        //await sendSocketIOEvent(doc, 'stop');
        await sendSocketIOEvent(sendMessage(doc, false));
        await updateDocument(collection, doc._id, { fin: addDays(doc.fin, 1) }); // Ajouter 1 jour à la end_time
     }
    }
    
    setTimeout(() => {
      socket.close();
      console.log('Socket.IO connection closed');
    }, 5000); // Temps en millisecondes
    
    return { success: true };
  } catch(err) {
    console.log("Error occurred while executing function:", err.message);
    return { error: err.message };
    
  }
};



async function sendSocketIOEvent(data) {
  try {
    if (!socket) {
      throw new Error('Socket.IO connection is not initialized');
    }

    socket.emit('data', data);
    console.log(`Socket.IO event sent`);
  } catch (error) {
    console.error('Error sending Socket.IO event:', error.message);
  }
}



function isWithinOneMinute(dateString) {
  const date = new Date(dateString);
  const diffInSeconds = Math.abs((new Date() - date) / 1000);
  return diffInSeconds < 60;
}


async function updateDocument(collection, documentId, update) {
  await collection.updateOne({ _id: documentId }, { $set: update });
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function sendMessage(document, action){
  
  imei = document.imei;
  sdm = document.sdm;
  perimetreLR = document.perimetre;
  

let message = {
    "type": 1, // Vous pouvez utiliser la même valeur que dans votre exemple ou une autre valeur si nécessaire
    "imei": imei, // Remplacez '' par la valeur que vous souhaitez pour imei
    "position": sdm, // Remplacez '' par la valeur que vous souhaitez pour position
    "perimetre": {
        "position": perimetreLR, // Remplacez '' par la valeur que vous souhaitez pour position dans perimetre
        "status": action // Remplacez false par true si nécessaire, selon votre logique
    }
  };

  
  return message;
}


