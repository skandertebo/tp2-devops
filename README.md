# TP2 DevOps - Application Todo avec CI/CD et Observabilité

## 📋 Description

Application de liste de tâches (Todo List) développée avec React.js, intégrant un pipeline CI/CD complet avec GitHub Actions et une solution d'observabilité comprenant des logs structurés, des métriques et du tracing distribué.

## 🚀 Fonctionnalités

- ✅ Application Todo List React.js moderne
- 🔄 Pipeline CI/CD avec GitHub Actions
- 📊 Observabilité complète (logs, métriques, traces)
- 🧪 Tests unitaires avec Vitest
- 🎨 Interface utilisateur moderne et responsive

## 🛠️ Technologies Utilisées

### Frontend

- **React.js 19** - Framework UI
- **Vite** - Build tool et dev server
- **CSS3** - Styling

### Testing

- **Vitest** - Test runner
- **Testing Library** - Test utilities
- **Happy-DOM** - DOM environment

### Observabilité

- **OpenTelemetry** - Distributed tracing
- **Web Vitals** - Performance metrics
- **Custom Logger** - Structured logging
- **Custom Metrics** - Business metrics

### CI/CD

- **GitHub Actions** - Automation pipeline
- **GitHub Pages** - Deployment

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/tp2devops.git

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Lancer les tests
npm test

# Build pour production
npm run build
```

## 🧪 Scripts Disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build l'application pour la production
- `npm run preview` - Prévisualise le build de production
- `npm test` - Lance les tests unitaires
- `npm run test:coverage` - Génère le rapport de couverture
- `npm run lint` - Lint le code

## 📊 Observabilité

### Logs Structurés

L'application utilise un logger personnalisé qui génère des logs en format JSON avec:

- Timestamp
- Niveau de log (DEBUG, INFO, WARN, ERROR)
- Contexte
- Métadonnées

### Métriques

Collecte automatique de métriques:

- Nombre total de todos
- Todos complétées
- Todos en cours
- Actions utilisateur (ajout, suppression, complétion)

### Tracing

Implémentation d'OpenTelemetry pour le tracing distribué:

- Traces pour chaque action utilisateur
- Spans avec attributs contextuels
- Export vers console (configurable pour OTLP)

### Performance Monitoring

Monitoring des Web Vitals:

- CLS (Cumulative Layout Shift)
- INP (Interaction to Next Paint)
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

## 🔄 Pipeline CI/CD

Le pipeline GitHub Actions comprend:

### 1. Tests

- Installation des dépendances
- Linting du code
- Exécution des tests unitaires
- Génération de coverage

### 2. Build

- Build de l'application
- Upload des artifacts

### 3. Déploiement

- Déploiement automatique sur GitHub Pages (branche main uniquement)

### ⚠️ Important : Configuration GitHub Pages

Pour que le déploiement fonctionne, vous devez :

1. Pousser le code sur GitHub
2. Activer GitHub Pages : **Settings → Pages → Source: GitHub Actions**
3. Voir le guide complet : [docs/DEPLOIEMENT_GITHUB.md](./docs/DEPLOIEMENT_GITHUB.md)

## 📝 Structure du Projet

```
tp2devops/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Pipeline CI/CD principal
│       └── observability-check.yml   # Vérification observabilité
├── src/
│   ├── components/
│   │   ├── TodoList.jsx             # Composant principal
│   │   ├── TodoList.css             # Styles
│   │   └── TodoList.test.jsx        # Tests
│   ├── observability/
│   │   ├── logger.js                # Logger structuré
│   │   ├── metrics.js               # Collecteur de métriques
│   │   ├── tracing.js               # OpenTelemetry setup
│   │   ├── performance.js           # Web Vitals
│   │   └── logger.test.js           # Tests du logger
│   ├── test/
│   │   └── setup.js                 # Configuration tests
│   ├── App.jsx                      # Composant racine
│   ├── App.css                      # Styles globaux
│   ├── main.jsx                     # Point d'entrée
│   └── index.css                    # Styles de base
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Objectifs Pédagogiques

Ce projet démontre:

- ✅ Intégration d'un pipeline CI/CD complet
- ✅ Mise en place d'une solution d'observabilité
- ✅ Tests automatisés et couverture de code
- ✅ Déploiement continu
- ✅ Bonnes pratiques DevOps

## 📖 Documentation Complète

Pour une documentation détaillée en français avec captures d'écran, consultez le fichier [RAPPORT.md](./RAPPORT.md).

## 👤 Auteur

TP2 DevOps - 2025

## 📄 Licence

MIT
