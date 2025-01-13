<<<<<<< HEAD
# GoofyChain
=======
# GoofyChain Backend

Backend pour l'interaction avec Etherscan API et la gestion d'authentification.

## Structure du Projet

```
/api
├── src/
│   ├── modules/
│   │   ├── auth/         # Authentification
│   │   ├── users/        # Gestion des utilisateurs
│   │   ├── blockchain/   # Services Etherscan
│   │   └── common/       # Utilitaires communs
│   ├── config/           # Configuration
│   ├── app.module.ts     # Module principal
│   └── main.ts          # Point d'entrée
├── package.json
└── .env
```

## Technologies Utilisées

- NestJS (Node.js)
- TypeScript
- MongoDB
- Redis
- JWT pour l'authentification
- ethers.js pour l'interaction blockchain

## Installation

```bash
cd api
npm install
```

## Configuration

1. Copiez `.env.example` vers `.env`
2. Configurez les variables d'environnement

## Démarrage

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start
```

## Points d'API

### Authentification
- POST /auth/login
- POST /auth/register

### Blockchain
- GET /blockchain/balance/:address
- GET /blockchain/transactions/:address
>>>>>>> d5cb677 (first commit)
