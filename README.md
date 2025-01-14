# GoofyChain - Gestionnaire de Portefeuille Ethereum

GoofyChain est une application web permettant de gérer vos portefeuilles Ethereum via l'API Etherscan. Elle offre une interface moderne et sécurisée pour suivre vos transactions et soldes.

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- Un compte Etherscan pour obtenir une clé API

## Installation

### Backend (API)

1. Naviguez vers le dossier api :

```bash
cd api
```

2. Installez les dépendances :

```bash
npm install
```

3. Configurez les variables d'environnement :

```bash
cp .env.example .env
```

4. Modifiez le fichier `.env` avec vos configurations :

```env
# Application
APP_URL=http://localhost:3000

# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=votre_username
DB_PASSWORD=votre_password
DB_DATABASE=goofychain

# JWT
JWT_SECRET=votre_secret_jwt

# Email
MAIL_HOST=votre_serveur_smtp
MAIL_PORT=587
MAIL_USER=votre_email
MAIL_PASSWORD=votre_mot_de_passe
MAIL_FROM=noreply@votre_domaine.com

# Etherscan
ETHERSCAN_API_KEY=votre_cle_api_etherscan
```

5. Lancez les migrations :

```bash
npm run migration:run
```

6. Démarrez le serveur de développement :

```bash
npm run start:dev
```

### Frontend (client-main)

1. Naviguez vers le dossier client-main :

```bash
cd client-main
```

2. Installez les dépendances :

```bash
npm install
```

3. Démarrez l'application :

```bash
npm run dev
```

## Structure du Projet

```
GoofyChain/
├── api/                    # Backend NestJS
│   ├── src/
│   │   ├── modules/       # Modules de l'application
│   │   │   ├── auth/     # Authentification
│   │   │   ├── users/    # Gestion des utilisateurs
│   │   │   ├── wallet/   # Gestion des portefeuilles
│   │   │   └── mail/     # Service d'emails
│   │   └── config/       # Configuration
│   └── test/             # Tests
└── client-main/          # Frontend React
    ├── src/
    │   ├── components/   # Composants React
    │   ├── pages/       # Pages de l'application
    │   └── services/    # Services API
    └── public/          # Fichiers statiques
```

## API Endpoints

### Authentification

```bash
# Inscription
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Activation du compte
curl -X GET http://localhost:3000/auth/activate/:token

# Connexion
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Portefeuilles

```bash
# Obtenir le solde d'un portefeuille
curl -X GET http://localhost:3000/wallet/balance/:address \
  -H "Authorization: Bearer votre_token_jwt"

# Obtenir les transactions d'un portefeuille
curl -X GET http://localhost:3000/wallet/transactions/:address \
  -H "Authorization: Bearer votre_token_jwt"
```

## Tests

### Backend

```bash
cd api
npm run test        # Tests unitaires
npm run test:e2e    # Tests end-to-end
```

### Frontend

```bash
cd client-main
npm run test
```

## Docker

Le projet peut également être exécuté avec Docker :

```bash
# Développement
docker-compose up -d

# Production
docker-compose -f prod.docker-compose.yml up -d
```

## Sécurité

- Authentification JWT
- Vérification par email obligatoire
- Hachage des mots de passe avec bcrypt
- Protection CSRF
- Rate limiting sur les endpoints sensibles

## Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request
