# Module d'Analyse de Wallet Ethereum

Ce module permet d'analyser en détail un portefeuille Ethereum, en fournissant des statistiques, un historique des transactions et une analyse de performance.

## 🚀 Fonctionnalités

- Analyse complète des transactions
- Calcul de la valeur du portfolio
- Statistiques de performance
- Historique des prix
- Analyse des frais de gas
- Support multi-devises

## 📚 API Endpoints

### 1. Analyser un Wallet
```http
POST /api/v1/wallet-analysis/analyze
```

**Corps de la requête :**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "currency": "EUR"
}
```

**Réponse :**
```json
{
  "id": "uuid-v4",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "currency": "EUR",
  "initialBalance": 1.5,
  "finalBalance": 2.3,
  "totalGasFees": 0.05,
  "totalIncoming": 1.2,
  "totalOutgoing": 0.4,
  "netProfit": 0.75,
  "transactions": [
    {
      "hash": "0x123...",
      "timestamp": "2024-01-15T10:30:00Z",
      "value": 0.5,
      "gasUsed": 0.002,
      "ethPrice": 2500.75,
      "fiatValue": 1250.375
    }
  ]
}
```

### 2. Récupérer une Analyse
```http
GET /api/v1/wallet-analysis/analysis
```

**Paramètres de requête :**
- `walletAddress`: Adresse du wallet
- `startDate`: Date de début (YYYY-MM-DD)
- `endDate`: Date de fin (YYYY-MM-DD)
- `currency`: Devise (défaut: EUR)

**Exemple de requête :**
```http
GET /api/v1/wallet-analysis/analysis?walletAddress=0x742d35Cc6634C0532925a3b844Bc454e4438f44e&startDate=2024-01-01&endDate=2024-12-31&currency=EUR
```

### 3. Points de Transaction
```http
GET /api/v1/wallet-analysis/transactions
```

**Paramètres de requête :**
- `analysisId`: ID de l'analyse

**Exemple de réponse :**
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "balance": 1.5,
    "ethPrice": 2500.75,
    "gasUsed": 0.002,
    "value": 0.5
  },
  {
    "timestamp": "2024-01-16T15:45:00Z",
    "balance": 1.8,
    "ethPrice": 2600.00,
    "gasUsed": 0.001,
    "value": 0.3
  }
]
```

### 4. Historique du Portfolio
```http
GET /api/v1/wallet-analysis/portfolio-history
```

**Paramètres :** Identiques à /analysis

**Exemple de réponse :**
```json
[
  {
    "timestamp": "2024-01-15T00:00:00Z",
    "value": 3750.00,
    "ethPrice": 2500.00,
    "netValue": 1.5
  },
  {
    "timestamp": "2024-01-16T00:00:00Z",
    "value": 4680.00,
    "ethPrice": 2600.00,
    "netValue": 1.8
  }
]
```

### 5. Statistiques du Portfolio
```http
GET /api/v1/wallet-analysis/portfolio-stats
```

**Exemple de réponse :**
```json
{
  "totalValue": 4680.00,
  "dailyChange": 24.8,
  "weeklyChange": 15.4,
  "monthlyChange": 35.2,
  "numberOfTransactions": 42,
  "averageTransactionValue": 0.75,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

### 6. Résumé des Transactions
```http
GET /api/v1/wallet-analysis/transactions-summary
```

**Exemple de réponse :**
```json
{
  "totalTransactions": 42,
  "totalIncoming": 15000.50,
  "totalOutgoing": 12000.25,
  "averageValue": 500.75,
  "totalGasFees": 250.30
}
```

## 🔒 Sécurité

- Rate Limiting : 5 requêtes par minute
- Validation des entrées
- Protection contre les attaques par force brute

## 🔌 Intégrations

- **Etherscan API** : Récupération des transactions
  - Limite : 100 000 requêtes par jour
  - Délai minimum entre requêtes : 200ms
- **CoinGecko API** : Prix historiques de l'ETH
  - Limite : 10 requêtes par seconde
  - Cache des prix pendant 1 heure

## ⚙️ Configuration

Variables d'environnement requises :
```env
ETHERSCAN_API_KEY=votre_clé_api
```

## 📊 Exemples d'Utilisation

### Analyse Simple
```typescript
const analysis = await walletAnalysisService.analyzeWallet(
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  new Date("2024-01-01"),
  new Date("2024-12-31"),
  "EUR"
);
```

### Statistiques Rapides
```typescript
const stats = await walletAnalysisService.getPortfolioStats(
  analysis.transactions,
  "EUR"
);
```

## 🚧 Limitations

- Maximum 100 transactions par requête
- Données historiques limitées à 2015
- Rate limiting Etherscan : 5 req/sec
- Cache des analyses : 1 heure

## 🔍 Codes d'Erreur

| Code | Description |
|------|-------------|
| 400  | Paramètres invalides |
| 401  | Non authentifié |
| 429  | Trop de requêtes |
| 500  | Erreur serveur |

## 📈 Performance

- Temps de réponse moyen : < 500ms
- Cache des analyses : 1 heure
- Pagination : 100 transactions par page
