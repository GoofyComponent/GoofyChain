# Documentation Détaillée des Routes GoofyChain

## 1. Système d'Authentification (`/api/v1/auth`)

### 1.1 Inscription et Activation du Compte
```http
POST /auth/register
```
**Objectif** : Permettre aux utilisateurs de créer un compte sécurisé
- Validation du mot de passe (8 caractères minimum, majuscules, minuscules, chiffres, caractères spéciaux)
- Hashage du mot de passe avec bcrypt
- Envoi d'un email de confirmation avec token
- Création d'un refresh token sécurisé (cookie HTTP-only)

```http
GET /auth/activate/:token
```
**Objectif** : Activer le compte utilisateur via email
- Validation du token d'activation
- Marquage du compte comme vérifié
- Protection contre la réutilisation du token

### 1.2 Connexion et Gestion de Session
```http
POST /auth/login
```
**Objectif** : Authentifier l'utilisateur de manière sécurisée
- Vérification des tentatives de connexion (max 5 tentatives/15 minutes)
- Génération d'un JWT (15 minutes d'expiration)
- Création d'un refresh token sécurisé
- Rate limiting (5 tentatives/minute)

```http
POST /auth/refresh
```
**Objectif** : Maintenir la session utilisateur active
- Validation du refresh token (cookie)
- Génération d'un nouveau JWT
- Rotation du refresh token pour la sécurité

```http
POST /auth/logout
```
**Objectif** : Déconnexion sécurisée
- Invalidation du refresh token
- Suppression du cookie
- Nettoyage de la session

### 1.3 Gestion du Mot de Passe
```http
POST /auth/forgot-password
```
**Objectif** : Initier la réinitialisation du mot de passe
- Vérification de l'existence de l'email
- Génération d'un token temporaire
- Envoi d'un email sécurisé
- Rate limiting pour prévenir les abus

```http
POST /auth/reset-password
```
**Objectif** : Finaliser la réinitialisation du mot de passe
- Validation du token de réinitialisation
- Vérification de la force du nouveau mot de passe
- Révocation de tous les tokens existants
- Mise à jour sécurisée du mot de passe

## 2. Analyse de Wallet (`/api/v1/wallet-analysis`)

### 2.1 Analyse Complète
```http
POST /wallet-analysis/analyze
```
**Objectif** : Analyser un portefeuille Ethereum
- Récupération des transactions via Etherscan API
- Calcul de la valeur historique via CryptoCompare
- Analyse des mouvements de fonds
- Support multi-devises (EUR, USD)

### 2.2 Consultation des Analyses
```http
GET /wallet-analysis/analysis
```
**Objectif** : Récupérer les analyses existantes
- Filtrage par période
- Conversion des devises
- Pagination des résultats
- Mise en cache des données fréquemment consultées

### 2.3 Historique et Statistiques
```http
GET /wallet-analysis/portfolio-history
```
**Objectif** : Visualiser l'évolution du portefeuille
- Calcul de la valeur historique
- Agrégation des données par période
- Support de différentes devises
- Optimisation des performances

```http
GET /wallet-analysis/portfolio-stats
```
**Objectif** : Fournir des statistiques détaillées
- Calcul des gains/pertes
- Analyse des performances
- Métriques de risque
- Tendances du marché

```http
GET /wallet-analysis/transactions
```
**Objectif** : Détailler les transactions
- Liste chronologique
- Catégorisation des transactions
- Calcul des impacts sur le portefeuille
- Enrichissement avec les données de prix

## 3. Sécurité et Performance

### 3.1 Protections Implémentées
- Rate Limiting sur toutes les routes sensibles
- Validation des entrées via DTOs
- Protection CSRF avec tokens
- Cookies sécurisés (HTTP-only, SameSite, Secure)
- Verrouillage de compte après échecs multiples

### 3.2 Optimisations
- Mise en cache des données fréquentes
- Pagination des résultats volumineux
- Compression des réponses
- Indexation des requêtes fréquentes

### 3.3 Logging et Monitoring
- Journalisation des événements importants
- Suivi des performances
- Alertes sur les anomalies
- Traçabilité des erreurs

## 4. Intégrations API

### 4.1 Etherscan API
- Récupération des transactions
- Analyse des smart contracts
- Suivi des tokens ERC20
- Vérification des statuts

### 4.2 CryptoCompare API
- Prix historiques des cryptomonnaies
- Conversion en temps réel
- Données de marché
- Indicateurs de tendance
