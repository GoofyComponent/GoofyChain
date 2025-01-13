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
- PostgreSQL
- TypeORM
- JWT pour l'authentification
- ethers.js pour l'interaction blockchain
- Docker & Docker Compose

## Installation

### Avec Docker (Recommandé)

1. Installez Docker et Docker Compose sur votre machine
2. Copiez `.env.example` vers `.env` et configurez les variables
3. Lancez l'environnement Docker :

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

Les services suivants seront disponibles :
- PostgreSQL : `localhost:5432`
- PGAdmin : `http://localhost:5050`
- MailHog UI : `http://localhost:8025`
- MailHog SMTP : `localhost:1025`

### Installation Manuelle

```bash
cd api
npm install
```

## Configuration

1. Copiez `.env.example` vers `.env`
2. Configurez les variables d'environnement :
   - Base de données (PostgreSQL)
   - Email (MailHog en développement)
   - Clé API Etherscan

## Démarrage

### Avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Supprimer les volumes (réinitialiser les données)
docker-compose down -v
```

### Sans Docker

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start
```

## Accès aux Outils

### PGAdmin (Interface PostgreSQL)
- URL : `http://localhost:5050`
- Email par défaut : `admin@admin.com`
- Mot de passe par défaut : `admin`

### MailHog (Serveur Email de Test)
- Interface Web : `http://localhost:8025`
- Serveur SMTP : `localhost:1025`
