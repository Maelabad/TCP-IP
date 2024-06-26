import socket
import json
import time
import random

# Définir les informations du serveur TCP/IP
server_address = ('44.201.156.7', 5000)

# Créer un socket TCP/IP
client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

imeis = ["IMEI123456789", "imei1234"]



try:
    # Se connecter au serveur TCP/IP
    client_socket.connect(server_address)
    print('Connected to server')


    ip_client = client_socket.getsockname()[0]
    data = f"1 - {imeis[1]}"
    client_socket.sendall(data.encode())
    print(f'Sent IMEI {imeis} to server')

    # Attendre la réponse du serveur (accusé de réception)
    response = client_socket.recv(1024)
    if response.decode() == "OK":
        print("Received acknowledgment from server")

    i = 0

    while True:
        # Envoyer des données au serveur
        print("Sending data to server from client...")
        sdm_id = "SDM123"  # Remplacez ceci par l'ID réel du SDM
        perimeter = "PerimeterA"  # Remplacez ceci par le périmètre réel
        text = "start watering"
        if i % 2 ==0:
            status = "true"
        else:
            status = "false"
        i = i + 1
        
        message = f"1 - {imeis[1]} - {sdm_id} - {perimeter} - {status}"


        # Convertir le dictionnaire en JSON et l'envoyer au serveur
        #json_data = json.dumps(message)
        client_socket.sendall(message.encode())


        print("Data sent from client")


        # Attendre un court laps de temps avant d'envoyer de nouvelles données
        time.sleep(8)

except Exception as e:
    print(f'Error: {e}')

finally:
    # Fermer la connexion
    client_socket.close()
