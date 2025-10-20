# TP2 DevOps - CI/CD et Observabilité

---

## Introduction

### Objectif du TP

Ce projet a pour but de démontrer l'intégration complète d'un pipeline CI/CD dans une application web moderne, ainsi que la mise en place d'une solution d'observabilité complète incluant :

- **Logs structurés** : Pour tracer les événements de l'application
- **Métriques** : Pour mesurer les performances et l'usage
- **Traces distribuées** : Pour suivre le parcours des requêtes

### Technologies Choisies

- **Frontend** : React.js 19 avec Vite
- **Backend** : Node.js/Express (instrumenté OpenTelemetry)
- **Testing** : Vitest + React Testing Library
- **CI/CD** : GitHub Actions (Docker + Kubernetes)
- **Observabilité** : OpenTelemetry Collector, **Tempo** (traces), **Loki** (logs), **Promtail** (collecteur de logs), **Prometheus** (métriques), **Grafana** (visualisation)

---

## Architecture du Projet

### Structure des Dossiers

```
tp2devops/
├── .github/workflows/        # Pipelines CI/CD
│   ├── ci.yml               # Pipeline principal
│   └── observability-check.yml
├── src/
│   ├── components/          # Composants React
│   │   ├── TodoList.jsx
│   │   ├── TodoList.css
│   │   └── TodoList.test.jsx
│   ├── observability/       # Outils FE (logs, tracing FE vers OTLP)
│   │   ├── logger.js
│   │   ├── logger.test.js
│   │   ├── metrics.js
│   │   └── tracing.js
│   └── test/                # Configuration tests
├── backend/                 # API Express + OTel + Prometheus + Pino
├── k8s/                     # Manifests Kubernetes (Prom, Loki, Tempo, OTel, Grafana, app)
├── config/                  # Config docker-compose (Prom, Tempo, Collector, Grafana, Promtail)
├── docker-compose.yml       # Stack locale complète
|-- Dockerfile # Dockerfile pour backend
|-- Dockerfile.dev # Dockerfile pour frontend
├── package.json
└── vite.config.js
```

---

## Application React Todo List

### Fonctionnalités Implémentées

L'application Todo List est volontairement simple mais fonctionnelle :

1. **Ajouter une tâche**

   - Saisie de texte
   - Validation (pas de tâche vide)
   - Ajout par clic ou touche Entrée

2. **Marquer comme complétée**

   - Checkbox interactive
   - Effet visuel (texte barré, opacité)
   - État persistant dans le composant

3. **Supprimer une tâche**

   - Bouton de suppression avec icône
   - Suppression immédiate

4. **Statistiques en temps réel**
   - Total des tâches
   - Nombre de tâches complétées
   - Nombre de tâches en cours

## Tests Unitaires

### Stratégie de Test

Nous avons implémenté **15 tests unitaires** couvrant :

- Le rendu des composants
- Les interactions utilisateur
- La logique métier
- Les outils d'observabilité

### Résultats des Tests

```
 ✓ src/observability/logger.test.js (6 tests) 3ms
 ✓ src/components/TodoList.test.jsx (9 tests) 269ms

 Test Files  2 passed (2)
      Tests  15 passed (15)
   Duration  712ms
```

**Couverture de code** : Les tests couvrent les fonctionnalités critiques de l'application.

---

## Pipeline CI/CD

### Architecture du Pipeline

Notre pipeline CI/CD est composé de **3 jobs principaux** :

```
┌─────────────┐
│    TEST     │  → Linting + Tests unitaires
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    BUILD    │  → Construction de l'application
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   DEPLOY    │  → Déploiement en utilisant kubectl
└─────────────┘
```

### Configuration GitHub Actions

```yaml
ci-k8s.yml (actif): build & push d'images Docker (frontend/backend) et étapes de déploiement Kubernetes (commentées).
```

### Étapes Détaillées

#### 1. Job TEST

**Objectif** : Valider la qualité du code

**Étapes** :

1. **Checkout** : Récupération du code source
2. **Setup Node.js** : Installation de Node.js 20 avec cache npm
3. **Install dependencies** : `npm ci` (installation clean et déterministe)
4. **Linting** : Vérification du style de code avec ESLint
5. **Tests** : Exécution de tous les tests unitaires avec Vitest

**Durée moyenne** : ~1-2 minutes

#### 2. Job BUILD

**Objectif** : Compiler l'application pour la production

**Étapes** :

1. Checkout du code
2. Installation des dépendances
3. **Build** : Compilation avec Vite (`npm run build`)
   - Minification du code
   - Tree-shaking
   - Code splitting
   - Optimisation des assets
4. **Upload artifacts** : Sauvegarde du dossier `dist/` pour 7 jours

**Durée moyenne** : ~1 minute

**Résultat du build** :

```
dist/index.html                   0.49 kB │ gzip:  0.30 kB
dist/assets/index-*.css           2.24 kB │ gzip:  0.94 kB
dist/assets/index-*.js          284.11 kB │ gzip: 90.23 kB
```

#### 3. Job DEPLOY

**Objectif** : Déployer l'application sur GitHub Pages

**Conditions** :

- Exécution uniquement sur la branche `main`
- Après succès des jobs TEST et BUILD
- Type d'événement : `push` (pas sur PR)

**Étapes** :

1. Application de kubectl
2. Attente de rollout de kubectl
3. Execution de smoketests

**Permissions requises** :

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Pipeline d'Observabilité

Un second pipeline vérifie l'intégration de l'observabilité :

```yaml
name: Observability Check

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: "0 9 * * *" # Tous les jours à 9h UTC

jobs:
  observability:
    steps:
      - name: Check for logging implementation
        run: grep -r "logger\." src/

      - name: Check for metrics implementation
        run: grep -r "metrics\." src/

      - name: Check for tracing implementation
        run: grep -r "createSpan" src/

      - name: Run smoke test
        run: |
          npm run dev &
          sleep 10
          kill $!
```

**Objectif** : S'assurer que les outils d'observabilité sont bien utilisés dans le code.

---

## Solution d'Observabilité

L'observabilité repose sur **trois piliers** : Logs, Métriques et Traces.

### 1. Logs Structurés

#### Architecture de Collecte des Logs

La collecte des logs utilise une architecture complète :

- **Backend** : Logs structurés JSON via Pino
- **Promtail** : Agent de collecte qui surveille les conteneurs Docker
- **Loki** : Système d'agrégation et de stockage des logs
- **Grafana** : Interface de visualisation et de requête

#### Configuration Promtail

```yaml
# config/promtail.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker-containers
    static_configs:
      - targets: [localhost]
        labels:
          job: docker
          container: backend
          __path__: /var/lib/docker/containers/*/*.log
```

#### Implémentation (logger.js)

```javascript
class Logger {
  constructor(context = "App") {
    this.context = context;
  }

  formatMessage(level, message, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...metadata,
    };
  }

  info(message, metadata) {
    const log = this.formatMessage("INFO", message, metadata);
    console.info(JSON.stringify(log));
  }

  // warn(), error(), debug() ...
}
```

#### Caractéristiques

- **Format JSON** : Facilite le parsing et l'analyse
- **Timestamp ISO** : Traçabilité temporelle précise
- **Contexte** : Identification de la source du log
- **Métadonnées** : Informations additionnelles dynamiques
- **Niveaux de log** : DEBUG, INFO, WARN, ERROR

#### Exemple de Log

```json
{
  "timestamp": "2025-10-19T15:27:51.234Z",
  "level": "INFO",
  "context": "TodoList",
  "message": "Todo added",
  "todoId": 1729349271234,
  "todoText": "Acheter du pain"
}
```

#### Utilisation dans l'Application

```javascript
const logger = new Logger("TodoList");

// Log d'information
logger.info("TodoList component mounted");

// Log d'avertissement avec métadonnées
logger.warn("Attempted to add empty todo");

// Log d'erreur avec contexte
logger.error("Failed to save todo", { error: error.message });
```

### 2. Métriques

#### Implémentation (metrics.js)

```javascript
class MetricsCollector {
  constructor() {
    this.counters = {}; // Valeurs qui augmentent
    this.gauges = {}; // Valeurs qui changent
    this.histograms = {}; // Distributions
  }

  incrementCounter(name, value = 1, labels = {}) {
    const key = this.generateKey(name, labels);
    if (!this.counters[key]) {
      this.counters[key] = { name, labels, value: 0 };
    }
    this.counters[key].value += value;
    console.info(`[METRIC] Counter ${name} = ${this.counters[key].value}`);
  }

  setGauge(name, value, labels = {}) {
    const key = this.generateKey(name, labels);
    this.gauges[key] = { name, labels, value };
    console.info(`[METRIC] Gauge ${name} = ${value}`);
  }
}

export const metrics = new MetricsCollector();
```

#### Types de Métriques Collectées

**Gauges (valeurs instantanées)** :

- `todos_total` : Nombre total de tâches
- `todos_completed` : Nombre de tâches complétées
- `todos_pending` : Nombre de tâches en cours

**Counters (incrémentation)** :

- `todos_added` : Nombre de tâches ajoutées (depuis le début)
- `todos_deleted` : Nombre de tâches supprimées
- `todos_completed_action` : Nombre de complétions
- `todos_uncompleted_action` : Nombre de dé-complétions

#### Exemple d'Utilisation

```javascript
// Mise à jour automatique des gauges
useEffect(() => {
  metrics.setGauge("todos_total", todos.length);
  metrics.setGauge("todos_completed", todos.filter((t) => t.completed).length);
  metrics.setGauge("todos_pending", todos.filter((t) => !t.completed).length);
}, [todos]);

// Incrémentation d'un compteur
const addTodo = () => {
  // ... logique d'ajout
  metrics.incrementCounter("todos_added");
};
```

#### Visualisation Console

```
[METRIC] Gauge todos_total = 3
[METRIC] Gauge todos_completed = 1
[METRIC] Gauge todos_pending = 2
[METRIC] Counter todos_added incremented to 5
```

### 3. Tracing Distribué (OpenTelemetry)

#### Implémentation (tracing.js)

```javascript
import { trace } from "@opentelemetry/api";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-web";

export function initializeTracing() {
  const provider = new WebTracerProvider();

  // Configuration de l'exporteur (console pour dev, OTLP pour prod)
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  return trace.getTracer("todo-app", "1.0.0");
}

export function createSpan(name, attributes = {}, fn) {
  const tracer = getTracer();
  const span = tracer.startSpan(name, { attributes });

  try {
    const result = fn(span);
    span.end();
    return result;
  } catch (error) {
    span.recordException(error);
    span.end();
    throw error;
  }
}
```

#### Caractéristiques

- **Provider Web** : Adapté pour applications frontend
- **Context Manager** : Gestion du contexte via Zone.js
- **Span Processor** : Traitement et export des spans
- **Exporteur Console** : Pour le développement (remplaçable par OTLP)

#### Utilisation dans l'Application

```javascript
const addTodo = () => {
  createSpan("add_todo", { todoText: inputValue }, () => {
    // Logique d'ajout de todo
    // Le span capture automatiquement le temps d'exécution
  });
};

const toggleTodo = (id) => {
  createSpan("toggle_todo", { todoId: id }, () => {
    // Logique de basculement
  });
};
```

#### Format de Trace

```javascript
{
  traceId: 'a1b2c3d4e5f6...',
  spanId: 'x1y2z3...',
  name: 'add_todo',
  kind: 'INTERNAL',
  timestamp: 1729349271234000,
  duration: 1234,
  attributes: {
    todoText: 'Acheter du pain'
  },
  status: { code: 'OK' }
}
```

### 4. Métriques de Performance (Web Vitals)

#### Implémentation (performance.js)

```javascript
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";

export function initPerformanceMonitoring() {
  // Cumulative Layout Shift
  onCLS((metric) => {
    console.info("[WEB VITAL] CLS:", metric);
  });

  // Interaction to Next Paint
  onINP((metric) => {
    console.info("[WEB VITAL] INP:", metric);
  });

  // Largest Contentful Paint
  onLCP((metric) => {
    console.info("[WEB VITAL] LCP:", metric);
  });

  // First Contentful Paint
  onFCP((metric) => {
    console.info("[WEB VITAL] FCP:", metric);
  });

  // Time to First Byte
  onTTFB((metric) => {
    console.info("[WEB VITAL] TTFB:", metric);
  });
}
```

#### Métriques Collectées

| Métrique | Description                               | Seuil Bon |
| -------- | ----------------------------------------- | --------- |
| **CLS**  | Stabilité visuelle (décalages)            | < 0.1     |
| **INP**  | Réactivité aux interactions               | < 200ms   |
| **LCP**  | Temps de chargement du plus grand élément | < 2.5s    |
| **FCP**  | Temps du premier rendu                    | < 1.8s    |
| **TTFB** | Temps de réponse du serveur               | < 0.8s    |

#### Exemple de Sortie

```javascript
[WEB VITAL] FCP: {
  name: 'FCP',
  value: 234.5,
  rating: 'good',
  delta: 234.5,
  entries: [...]
}

[WEB VITAL] LCP: {
  name: 'LCP',
  value: 1245.2,
  rating: 'good',
  delta: 1245.2,
  entries: [...]
}
```

### Initialisation Globale

```javascript
// App.jsx
useEffect(() => {
  logger.info("Application starting...");

  try {
    initializeTracing();
    initPerformanceMonitoring();
    logger.info("Observability initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize observability", {
      error: error.message,
    });
  }
}, []);
```

### Avantages de Cette Architecture

1. **Modularité** : Chaque aspect d'observabilité est indépendant
2. **Extensibilité** : Facile d'ajouter de nouveaux exporteurs (Prometheus, Jaeger, etc.)
3. **Performance** : Impact minimal sur l'application
4. **Debugging** : Facilite le diagnostic des problèmes
5. **Production-ready** : Peut être connecté à des backends d'observabilité (Grafana, Datadog, etc.)

---

## Exécution Locale et Déploiement

### Docker Compose (local)

- Démarrage: `docker compose up -d`
- Accès:
  - Grafana http://localhost:3000 (admin/admin)
  - Prometheus http://localhost:9090
  - OpenTelemetry Collector http://localhost:8888/metrics
  - Backend API http://localhost:3001
  - Frontend http://localhost:5173
  - Promtail collecte automatiquement les logs des conteneurs Docker

### Kubernetes (Minikube)

- `./scripts/setup-observability.sh` puis `./scripts/deploy-application.sh`

---

## Démonstration et Résultats

### Tests Réussis

```bash
$ npm test

 ✓ src/observability/logger.test.js (6 tests) 3ms
   ✓ should create a logger with correct context
   ✓ should log debug messages
   ✓ should log info messages
   ✓ should log warn messages
   ✓ should log error messages
   ✓ should include timestamp in logs

 ✓ src/components/TodoList.test.jsx (9 tests) 269ms
   ✓ should render the todo list component
   ✓ should display empty state when no todos exist
   ✓ should add a new todo when clicking add button
   ✓ should add a new todo when pressing Enter key
   ✓ should not add empty todos
   ✓ should toggle todo completion status
   ✓ should delete a todo
   ✓ should display correct statistics
   ✓ should handle multiple todos correctly

 Test Files  2 passed (2)
      Tests  15 passed (15)
   Duration  712ms
```

### Build Optimisé

```bash
$ npm run build

✓ 172 modules transformed.
dist/index.html                   0.49 kB │ gzip:  0.30 kB
dist/assets/index-*.css           2.24 kB │ gzip:  0.94 kB
dist/assets/index-*.js          284.11 kB │ gzip: 90.23 kB
✓ built in 504ms
```

### Traces d'Observabilité (Exemple d'Exécution)

- Etape 1: Ouverture de l'application et l'ajout d'un todo **Clean House**
- Etape 2: Marquer ce TODO comme complet

<image placeholder>

Ouverture de Grafana -> Explore -> Tempo:

<image placeholder>

Le trace de l'operation PUT relative a ce TODO est marqué dans le dashboard de Tempo

### Dashboard Prometheus dans Grafana

Voici le dashboard Prometheus qui mesure le metric suivant: **Active Todos**
<image placeholder>

### Requêtes de Logs dans Grafana

Avec Promtail configuré, les logs sont automatiquement collectés et disponibles dans Grafana :

1. **Accès** : Grafana → Explore → Loki
2. **Requêtes utiles** :
   - `{container="backend"}` : Logs du backend uniquement
   - `{job="docker"} |= "todo"` : Logs contenant "todo"
   - `{container="backend"} | json` : Logs structurés JSON

<image placeholder>

---

## Conclusion

### Objectifs Atteints

✅ **Pipeline CI/CD** :

- Tests automatisés
- Build optimisé
- Déploiement continu sur GitHub Pages

✅ **Observabilité complète** :

- **Logs structurés** : Format JSON avec contexte et métadonnées, collectés par Promtail
- **Métriques** : Gauges et counters pour suivre l'usage via Prometheus
- **Traces** : OpenTelemetry pour le suivi distribué via Tempo
- **Performance** : Web Vitals pour les métriques UX
- **Visualisation** : Interface unifiée Grafana pour logs, métriques et traces
