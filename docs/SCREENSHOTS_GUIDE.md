# Guide des Captures d'Écran - TP2 DevOps

## 📸 Comment Créer les Captures d'Écran

Ce document explique quelles captures d'écran prendre pour compléter le rapport.

## Sections à Illustrer

### 1. Application Todo List

#### 1.1 Interface Vide
**Capture** : Application sans tâche
- URL : `http://localhost:5173`
- Montrer : 
  - Titre "📝 Liste de Tâches"
  - Champ de saisie
  - Message "Aucune tâche..."
  - Statistiques à 0

**Nom du fichier** : `01-app-empty.png`

#### 1.2 Ajout de Tâches
**Capture** : En train d'ajouter une tâche
- Montrer :
  - Texte dans le champ de saisie
  - Curseur actif
  - Focus sur l'input

**Nom du fichier** : `02-app-adding-todo.png`

#### 1.3 Liste avec Tâches
**Capture** : Plusieurs tâches affichées
- Montrer :
  - 3-4 tâches dans la liste
  - Statistiques mises à jour
  - Checkbox et boutons de suppression

**Nom du fichier** : `03-app-with-todos.png`

#### 1.4 Tâche Complétée
**Capture** : Tâche cochée
- Montrer :
  - Checkbox cochée
  - Texte barré
  - Opacité réduite
  - Statistiques mises à jour

**Nom du fichier** : `04-app-completed-todo.png`

### 2. Console d'Observabilité

#### 2.1 Logs Structurés
**Capture** : Console avec logs JSON
- Ouvrir : DevTools (F12) → Console
- Montrer :
  - Logs d'initialisation
  - Log "TodoList component mounted"
  - Log "Todo added" avec métadonnées

**Nom du fichier** : `05-console-logs.png`

**Exemple à capturer** :
```json
{"timestamp":"2025-10-19T...","level":"INFO","context":"App","message":"Application starting..."}
{"timestamp":"2025-10-19T...","level":"INFO","context":"TodoList","message":"Todo added","todoId":123456}
```

#### 2.2 Métriques
**Capture** : Console avec métriques
- Filtrer : "[METRIC]"
- Montrer :
  - Gauges (todos_total, todos_completed, todos_pending)
  - Counters (todos_added)

**Nom du fichier** : `06-console-metrics.png`

**Exemple à capturer** :
```
[METRIC] Gauge todos_total = 3
[METRIC] Gauge todos_completed = 1
[METRIC] Counter todos_added incremented to 5
```

#### 2.3 Web Vitals
**Capture** : Console avec Web Vitals
- Filtrer : "[WEB VITAL]"
- Montrer :
  - FCP, LCP, CLS, INP, TTFB
  - Valeurs et ratings

**Nom du fichier** : `07-console-webvitals.png`

#### 2.4 Traces OpenTelemetry
**Capture** : Console avec traces
- Montrer :
  - Spans avec traceId et spanId
  - Attributs des spans
  - Durées d'exécution

**Nom du fichier** : `08-console-traces.png`

### 3. Tests

#### 3.1 Résultats des Tests
**Capture** : Terminal avec résultats de tests
- Commande : `npm test -- --run`
- Montrer :
  - 2 fichiers de test
  - 15 tests passés
  - Temps d'exécution

**Nom du fichier** : `09-tests-results.png`

**Exemple** :
```
 ✓ src/observability/logger.test.js (6 tests) 3ms
 ✓ src/components/TodoList.test.jsx (9 tests) 269ms

 Test Files  2 passed (2)
      Tests  15 passed (15)
```

#### 3.2 Tests en Mode Watch
**Capture** : Tests en mode watch
- Commande : `npm test`
- Montrer :
  - Interface interactive
  - Watch mode actif

**Nom du fichier** : `10-tests-watch.png`

### 4. Build de Production

#### 4.1 Build Output
**Capture** : Terminal avec build output
- Commande : `npm run build`
- Montrer :
  - Transformation des modules
  - Tailles des fichiers
  - Compression gzip
  - Temps de build

**Nom du fichier** : `11-build-output.png`

**Exemple** :
```
✓ 172 modules transformed.
dist/index.html                   0.49 kB │ gzip:  0.30 kB
dist/assets/index-*.css           2.24 kB │ gzip:  0.94 kB
dist/assets/index-*.js          284.11 kB │ gzip: 90.23 kB
✓ built in 504ms
```

### 5. GitHub Actions

#### 5.1 Vue d'Ensemble des Workflows
**Capture** : Page Actions de GitHub
- URL : `https://github.com/username/tp2devops/actions`
- Montrer :
  - Liste des workflows
  - CI/CD Pipeline et Observability Check
  - Statuts (✓ success)

**Nom du fichier** : `12-github-actions-overview.png`

#### 5.2 Détails d'un Workflow Réussi
**Capture** : Détails d'une exécution
- Montrer :
  - Les 3 jobs (test, build, deploy)
  - Statuts verts
  - Temps d'exécution

**Nom du fichier** : `13-github-actions-workflow.png`

#### 5.3 Job Test - Détails
**Capture** : Logs du job Test
- Montrer :
  - Checkout code
  - Setup Node.js
  - Install dependencies
  - Run linter
  - Run tests (tous passent)

**Nom du fichier** : `14-github-actions-test-job.png`

#### 5.4 Job Build - Détails
**Capture** : Logs du job Build
- Montrer :
  - Build application
  - Upload artifacts
  - Tailles des fichiers

**Nom du fichier** : `15-github-actions-build-job.png`

#### 5.5 Job Deploy - Détails
**Capture** : Logs du job Deploy
- Montrer :
  - Setup Pages
  - Upload to Pages
  - Deploy successful
  - URL de déploiement

**Nom du fichier** : `16-github-actions-deploy-job.png`

### 6. GitHub Pages

#### 6.1 Configuration GitHub Pages
**Capture** : Settings → Pages
- URL : `https://github.com/username/tp2devops/settings/pages`
- Montrer :
  - Source : GitHub Actions
  - URL du site
  - Status : déployé

**Nom du fichier** : `17-github-pages-settings.png`

#### 6.2 Site Déployé
**Capture** : Application déployée
- URL : `https://username.github.io/tp2devops/`
- Montrer :
  - Application fonctionnelle en production
  - URL dans la barre d'adresse
  - Certificat HTTPS

**Nom du fichier** : `18-deployed-app.png`

### 7. Structure du Projet

#### 7.1 Arborescence des Fichiers
**Capture** : VS Code avec l'explorateur de fichiers
- Montrer :
  - Dossier .github/workflows/
  - Dossier src/ avec sous-dossiers
  - Fichiers de configuration
  - README.md et RAPPORT.md

**Nom du fichier** : `19-project-structure.png`

#### 7.2 Code Source - TodoList.jsx
**Capture** : Fichier TodoList.jsx ouvert
- Montrer :
  - Imports d'observabilité
  - Utilisation du logger
  - Utilisation des métriques
  - Utilisation du tracing

**Nom du fichier** : `20-code-todolist.png`

#### 7.3 Code - Observability/logger.js
**Capture** : Fichier logger.js
- Montrer :
  - Classe Logger
  - Méthodes de log
  - Format JSON

**Nom du fichier** : `21-code-logger.png`

### 8. Workflow CI/CD (Fichiers)

#### 8.1 Fichier ci.yml
**Capture** : .github/workflows/ci.yml
- Montrer :
  - Définition des jobs
  - Étapes du pipeline
  - Conditions de déploiement

**Nom du fichier** : `22-cicd-workflow-file.png`

#### 8.2 package.json
**Capture** : package.json
- Montrer :
  - Scripts npm
  - Dépendances
  - DevDependencies

**Nom du fichier** : `23-package-json.png`

## 🎨 Conseils pour de Belles Captures

### Résolution
- Résolution minimale : 1920x1080
- Format : PNG (meilleure qualité pour le texte)

### Édition
- Recadrer pour montrer uniquement le contenu pertinent
- Ajouter des flèches/annotations si nécessaire
- Utiliser des encadrés rouges pour mettre en évidence

### Terminal
- Utiliser un thème clair ou sombre cohérent
- Police lisible (minimum 14px)
- Nettoyer l'historique avant la capture

### Navigateur
- Masquer les extensions inutiles
- Mode plein écran ou sans distractions
- Onglets propres

## 📝 Organisation des Captures

Créer un dossier `docs/screenshots/` :

```
docs/
└── screenshots/
    ├── 01-app-empty.png
    ├── 02-app-adding-todo.png
    ├── 03-app-with-todos.png
    ├── 04-app-completed-todo.png
    ├── 05-console-logs.png
    ├── 06-console-metrics.png
    ├── 07-console-webvitals.png
    ├── 08-console-traces.png
    ├── 09-tests-results.png
    ├── 10-tests-watch.png
    ├── 11-build-output.png
    ├── 12-github-actions-overview.png
    ├── 13-github-actions-workflow.png
    ├── 14-github-actions-test-job.png
    ├── 15-github-actions-build-job.png
    ├── 16-github-actions-deploy-job.png
    ├── 17-github-pages-settings.png
    ├── 18-deployed-app.png
    ├── 19-project-structure.png
    ├── 20-code-todolist.png
    ├── 21-code-logger.png
    ├── 22-cicd-workflow-file.png
    └── 23-package-json.png
```

## 🔗 Intégration dans le Rapport

Dans `RAPPORT.md`, ajouter les images :

```markdown
### Interface de l'Application

![Application vide](./docs/screenshots/01-app-empty.png)
*Figure 1 : Application Todo List à l'état initial*

### Logs Structurés

![Logs dans la console](./docs/screenshots/05-console-logs.png)
*Figure 2 : Exemple de logs structurés en JSON*

### Pipeline CI/CD

![GitHub Actions](./docs/screenshots/13-github-actions-workflow.png)
*Figure 3 : Exécution du pipeline CI/CD*
```

## ✅ Checklist Finale

- [ ] 23 captures d'écran créées
- [ ] Toutes nommées selon la convention
- [ ] Résolution suffisante (> 1920x1080)
- [ ] Format PNG
- [ ] Placées dans `docs/screenshots/`
- [ ] Référencées dans RAPPORT.md
- [ ] Annotations ajoutées si nécessaire
- [ ] Commit des images dans Git

