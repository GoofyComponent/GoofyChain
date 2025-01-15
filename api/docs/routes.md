# Documentation des Routes de l'API GoofyChain

## 🔐 Module d'Authentification (`/api/v1/auth`)

### Inscription et Connexion
- **POST** `/auth/register`
  - Description : Inscription d'un nouvel utilisateur
  - Corps : `RegisterDto` (email, password)
  - Retour : Token JWT + Refresh Token (cookie)

- **POST** `/auth/login`
  - Description : Connexion d'un utilisateur
  - Corps : `LoginDto` (email, password)
  - Retour : Token JWT + Refresh Token (cookie)
  - Sécurité : `LocalAuthGuard`

### Gestion des Tokens
- **POST** `/auth/refresh`
  - Description : Rafraîchissement du token JWT
  - Sécurité : `JwtAuthGuard`
  - Utilise : Cookie 'refresh_token'
  - Retour : Nouveau token JWT + Refresh Token

- **POST** `/auth/logout`
  - Description : Déconnexion de l'utilisateur
  - Sécurité : `JwtAuthGuard`
  - Action : Supprime le refresh token

### Gestion du Compte
- **GET** `/auth/activate/:token`
  - Description : Activation du compte utilisateur
  - Paramètre : Token d'activation

- **GET** `/auth/profile`
  - Description : Récupération du profil utilisateur
  - Sécurité : `JwtAuthGuard`

### Réinitialisation du Mot de Passe
- **POST** `/auth/forgot-password`
  - Description : Demande de réinitialisation du mot de passe
  - Corps : `ForgotPasswordDto` (email)

- **POST** `/auth/reset-password`
  - Description : Réinitialisation du mot de passe
  - Corps : `ResetPasswordDto` (token, nouveau mot de passe)

## 📊 Analyse de Wallet (`/api/v1/wallet-analysis`)

### Analyses
- **POST** `/wallet-analysis/analyze`
  - Description : Analyse complète d'un wallet Ethereum
  - Corps :
    - walletAddress : Adresse du wallet
    - startDate : Date de début
    - endDate : Date de fin
    - currency (optionnel) : Devise (défaut: EUR)

- **GET** `/wallet-analysis/analysis`
  - Description : Récupération d'une analyse existante
  - Paramètres Query :
    - walletAddress
    - startDate
    - endDate
    - currency (optionnel, défaut: EUR)

### Transactions et Portfolio
- **GET** `/wallet-analysis/transactions`
  - Description : Points de transaction pour une analyse
  - Paramètre Query : analysisId

- **GET** `/wallet-analysis/portfolio-history`
  - Description : Historique de la valeur du portfolio
  - Paramètres Query :
    - walletAddress
    - startDate
    - endDate
    - currency (optionnel, défaut: EUR)

- **GET** `/wallet-analysis/portfolio-stats`
  - Description : Statistiques du portfolio
  - Paramètres Query :
    - walletAddress
    - startDate
    - endDate
    - currency (optionnel, défaut: EUR)

## 🔒 Sécurité et Limitations

- Rate Limiting : 5 requêtes par minute par IP
- Authentification : JWT (15 minutes) + Refresh Token
- Validation des données : DTO avec class-validator
- Protection CSRF : Tokens dans les cookies httpOnly

## 📝 Notes

- Toutes les routes sont versionnées (v1)
- Les dates doivent être au format ISO 8601
- Les devises supportées : EUR, USD (par défaut: EUR)
- Les réponses incluent des métadonnées de pagination quand applicable
