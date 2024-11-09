# Hazelnut API

Hazelnut API est une API simple pour générer et gérer des clés avec différents types de validité (daily, monthly, yearly, one-time, lifetime). Les clés sont stockées dans une base de données Quick.DB.

## Prérequis

- Node.js
- npm (ou yarn)

## Installation

1. Clonez le dépôt :
    ```bash
    git clone https://github.com/votre-utilisateur/hazelnut-api.git
    cd hazelnut-api
    ```

2. Installez les dépendances :
    ```bash
    npm install
    ```

## Utilisation

1. Démarrez le serveur :
    ```bash
    node main.js
    ```

2. Utilisez l'API pour créer et utiliser des clés.

## Endpoints

### Créer une clé

- **URL** : `/create-key`
- **Méthode** : `POST`
- **Corps de la requête** :
    ```json
    {
        "type": "lifetime", // ou 'daily', 'monthly', 'yearly', 'one-time'
        "format": "KEY-XXXXXX" // votre format de clé personnalisé
    }
    ```
- **Réponse** :
    ```json
    {
        "key": "KEY-422JKS",
        "type": "lifetime",
        "expiration": "9999-12-31T00:00:00.000Z"
    }
    ```

### Utiliser une clé

- **URL** : `/redeem-key`
- **Méthode** : `POST`
- **Corps de la requête** :
    ```json
    {
        "key": "KEY-422JKS"
    }
    ```
- **Réponse** :
    ```json
    {
        "success": "Key redeemed successfully"
    }
    ```

## Exemple d'utilisation avec Axios

Voici un exemple de script utilisant Axios pour créer une clé :

```javascript
const axios = require('axios');

const createKey = async () => {
    try {
        const response = await axios.post('http://localhost:1335/create-key', {
            type: 'lifetime', // ou 'daily', 'monthly', 'yearly', 'one-time'
            format: 'TEST-XXXXXX' // votre format de clé personnalisé
        });
        console.log('Key created:', response.data);
    } catch (error) {
        console.error('Error creating key:', error.response ? error.response.data : error.message);
    }
};

createKey();
```
Fonctionnement interne

Fonction pour générer une clé unique

```javascript 
async function generateUniqueKey(format) {
    let key;
    let exists = true;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    while (exists) {
        key = format.replace(/X/g, () => characters.charAt(Math.floor(Math.random() * characters.length)));
        exists = await db.has(key);
    }

    return key;
}
``` 


Fonction pour obtenir la date d'expiration en fonction du type de clé

```javascript 

function getExpirationDate(type) {
    const now = new Date();
    switch (type) {
        case 'daily':
            return new Date(now.setDate(now.getDate() + 1));
        case 'monthly':
            return new Date(now.setMonth(now.getMonth() + 1));
        case 'yearly':
            return new Date(now.setFullYear(now.getFullYear() + 1));
        case 'one-time':
            return now;
        case 'lifetime':
            return new Date(9999, 11, 31);
        default:
            throw new Error("Invalid key type");
    }
}
```


# Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.