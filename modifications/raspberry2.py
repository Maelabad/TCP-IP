import socket
import json
import time
import random
import select


# Définir les informations du serveur TCP/IP
server_address = ('34.203.244.3', 5000)

# Créer un socket TCP/IP
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

try:
    # Se connecter au serveur TCP/IP
    client_socket.connect(server_address)
    print('Connected to server')

    # Envoyer l'IMEI et l'adresse IP au serveur
    imei = "IMEI123456789"  # Remplacez ceci par l'IMEI réel de votre Raspberry Pi
    ip_address = "192.168.1.45"  # Récupérer l'adresse IP du client
    
    
    data = f"{0} - {imei}"


    client_socket.sendall(data.encode())
    print(f'Sent IMEI {imei} and IP address {ip_address} to server')

    # Attendre la réponse du serveur (accusé de réception)
    response = client_socket.recv(1024)

    print(response)

    if response.decode() == "OK":
        print("Received acknowledgment from server")

    while True:
        # Envoyer des données au serveur
        print("Sending data to server from Raspberry Pi...")
        sdm_id = "SDM123"  # Remplacez ceci par l'ID réel du SDM
        perimeter = "PerimeterA"  # Remplacez ceci par le périmètre réel
        soil_hum = random.uniform(20.0, 40.0)  # Générer une valeur aléatoire pour l'humidité du sol
        message = f"{0} - {imei} - {ip_address} - {sdm_id} - {perimeter} - {soil_hum}"

        # Convertir le dictionnaire en JSON et l'envoyer au serveur
        #json_data = json.dumps(message)
        #client_socket.sendall(json_data.encode())
        
        client_socket.sendall(message.encode())


        print("Data sent from Raspberry Pi")

        # Attendre un court laps de temps avant d'envoyer de nouvelles données
        time.sleep(10)

            # Vérifier s'il y a des données à recevoir
        ready_to_read, _, _ = select.select([client_socket], [], [], 0)
        for sock in ready_to_read:
            data = sock.recv(1024)
            if data:
                print("Received data from server:", data.decode())

except Exception as e:
    print(f'Error: {e}')

finally:
    # Fermer la connexion
    client_socket.close()
