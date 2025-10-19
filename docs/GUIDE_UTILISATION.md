# Guide d'Utilisation - TP2 DevOps

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** : Version 20.x ou supérieure
- **npm** : Version 10.x ou supérieure
- **Git** : Version 2.x ou supérieure

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/tp2devops.git
cd tp2devops

# 2. Installer les dépendances
npm install

# 3. Lancer l'application en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📱 Utilisation de l'Application

### Ajouter une Tâche

1. Cliquez dans le champ de saisie
2. Tapez le texte de votre tâche
3. Appuyez sur **Entrée** ou cliquez sur le bouton **Ajouter**

### Marquer une Tâche comme Complétée

1. Cochez la case à gauche de la tâche
2. La tâche sera barrée et en grisé

### Supprimer une Tâche

1. Cliquez sur l'icône 🗑️ à droite de la tâche
2. La tâche sera supprimée immédiatement

### Statistiques

Les statistiques en haut de la liste se mettent à jour automatiquement :
- **Total** : Nombre total de tâches
- **Complétées** : Nombre de tâches terminées
- **En cours** : Nombre de tâches restantes

## 🧪 Tests

### Lancer les Tests

```bash
# Mode watch (relance automatiquement)
npm test

# Une seule exécution
npm test -- --run

# Avec rapport de couverture
npm run test:coverage

# Avec interface UI
npm run test:ui
```

### Tests Disponibles

| Fichier | Tests | Description |
|---------|-------|-------------|
| `TodoList.test.jsx` | 9 | Tests du composant principal |
| `logger.test.js` | 6 | Tests du système de logs |

## 🔧 Développement

### Commandes Disponibles

```bash
# Développement
npm run dev          # Lancer le serveur de dev (port 5173)
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Qualité
npm run lint         # Vérifier le code avec ESLint
npm test             # Lancer les tests

# CI/CD (utilisé par GitHub Actions)
npm ci               # Installation propre (CI)
```

### Structure du Code

```
src/
├── App.jsx                 # Composant racine
├── main.jsx               # Point d'entrée
├── components/
│   └── TodoList.jsx       # Composant de la liste
├── observability/         # Outils d'observabilité
│   ├── logger.js
│   ├── metrics.js
│   ├── tracing.js
│   └── performance.js
└── test/
    └── setup.js          # Configuration des tests
```

## 📊 Observabilité

### Console du Navigateur

Ouvrez la console de votre navigateur (F12) pour voir :

#### 1. Logs Structurés

```json
{
  "timestamp": "2025-10-19T15:30:12.456Z",
  "level": "INFO",
  "context": "TodoList",
  "message": "Todo added",
  "todoId": 1729349412456
}
```

#### 2. Métriques

```
[METRIC] Gauge todos_total = 3
[METRIC] Counter todos_added incremented to 5
```

#### 3. Web Vitals

```
[WEB VITAL] FCP: { name: 'FCP', value: 234.5, rating: 'good' }
[WEB VITAL] LCP: { name: 'LCP', value: 1245.2, rating: 'good' }
```

#### 4. Traces OpenTelemetry

```json
{
  "traceId": "a1b2c3d4e5f6...",
  "spanId": "x1y2z3...",
  "name": "add_todo",
  "duration": 1234,
  "attributes": { "todoText": "Acheter du pain" }
}
```

### Filtrer les Logs

Dans la console du navigateur :

```javascript
// Filtrer uniquement les logs INFO
// Rechercher : "level":"INFO"

// Filtrer les métriques
// Rechercher : [METRIC]

// Filtrer les web vitals
// Rechercher : [WEB VITAL]
```

## 🔄 CI/CD avec GitHub Actions

### Déclencher le Pipeline

Le pipeline se déclenche automatiquement sur :
- **Push** vers `main` ou `develop`
- **Pull Request** vers `main`

### Étapes du Pipeline

1. **Tests** (1-2 min)
   - Installation des dépendances
   - Linting du code
   - Exécution des tests unitaires

2. **Build** (1 min)
   - Compilation de l'application
   - Optimisation des assets
   - Upload des artifacts

3. **Deploy** (30 sec) - *Uniquement sur `main`*
   - Déploiement sur GitHub Pages

### Voir les Résultats

1. Allez sur l'onglet **Actions** dans GitHub
2. Cliquez sur le workflow en cours
3. Consultez les logs de chaque job

## 🌐 Déploiement

### Configuration GitHub Pages

1. Allez dans **Settings** → **Pages**
2. Source : **GitHub Actions**
3. Le site sera disponible sur : `https://[username].github.io/tp2devops/`

### Build Local pour Production

```bash
# Build l'application
npm run build

# Le dossier dist/ contient les fichiers statiques
ls -lh dist/

# Prévisualiser le build localement
npm run preview
```

## 🐛 Dépannage

### Problème : Port 5173 déjà utilisé

```bash
# Tuer le processus sur le port 5173
kill -9 $(lsof -t -i:5173)

# Ou utiliser un autre port
npm run dev -- --port 3000
```

### Problème : Tests qui échouent

```bash
# Vider le cache et réinstaller
rm -rf node_modules package-lock.json
npm install

# Relancer les tests
npm test -- --run
```

### Problème : Build qui échoue

```bash
# Vérifier la version de Node
node --version  # Devrait être >= 20.x

# Nettoyer et rebuild
rm -rf dist
npm run build
```

### Problème : Observabilité non visible

Ouvrez la console du navigateur (F12) et vérifiez :
- Onglet **Console** pour les logs
- Aucun filtre actif (niveau de log)
- L'application est bien en cours d'exécution

## 📈 Monitoring en Production

### Métriques à Surveiller

1. **Performance**
   - First Contentful Paint (FCP) < 1.8s
   - Largest Contentful Paint (LCP) < 2.5s
   - Cumulative Layout Shift (CLS) < 0.1
   - Interaction to Next Paint (INP) < 200ms

2. **Usage**
   - `todos_added` : Tâches créées
   - `todos_completed_action` : Tâches terminées
   - `todos_deleted` : Tâches supprimées

3. **Erreurs**
   - Logs de niveau ERROR
   - Exceptions dans les spans

### Export vers Services Externes

Pour connecter à Grafana/Prometheus (production) :

```javascript
// src/observability/tracing.js
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const exporter = new OTLPTraceExporter({
  url: 'https://your-otel-collector:4318/v1/traces',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
```

## 📚 Ressources

### Documentation

- [README.md](../README.md) - Vue d'ensemble
- [RAPPORT.md](../RAPPORT.md) - Rapport technique complet
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée

### Liens Utiles

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest API](https://vitest.dev/api/)
- [OpenTelemetry JS](https://opentelemetry.io/docs/languages/js/)
- [Web Vitals](https://web.dev/vitals/)

## 🆘 Support

En cas de problème :

1. Consultez la section [Dépannage](#dépannage)
2. Vérifiez les logs dans la console
3. Consultez les issues GitHub
4. Créez une nouvelle issue avec :
   - Description du problème
   - Version de Node.js
   - Logs d'erreur
   - Étapes pour reproduire

