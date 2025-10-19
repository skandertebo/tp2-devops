# TP2 DevOps - Observabilité Production-Ready

## 🎯 Vue d'Ensemble

Projet de démonstration complet intégrant :
- ✅ Application full-stack (React + Express)
- ✅ Pipeline CI/CD avec GitHub Actions
- ✅ **Stack d'observabilité complète** avec les trois piliers

## 📊 Stack d'Observabilité

### Architecture

```
Application (Frontend + Backend)
          │
          ▼
  OpenTelemetry Collector
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
 Tempo  Loki  Prometheus
    │     │     │
    └─────┴─────┘
          │
          ▼
      Grafana
```

### Composants

| Composant | Rôle | Port | Accès |
|-----------|------|------|-------|
| **OpenTelemetry Collector** | Point d'entrée telemetry | 4317/4318 | - |
| **Tempo** | Traces distribuées | 3200 | Port-forward |
| **Loki** | Agrégation de logs | 3100 | Port-forward |
| **Prometheus** | Métriques time-series | 9090 | Port-forward |
| **Promtail** | Collection de logs | - | DaemonSet |
| **Prometheus Operator** | Gestion Prometheus | - | CRDs |
| **Grafana** | Visualisation | 3000 | NodePort:30300 |

---

## 🚀 Démarrage Rapide

### Option 1 : Docker Compose (Local)

```bash
# Démarrer toute la stack
docker-compose up -d

# Accès
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090
- Tempo: http://localhost:3200
- Loki: http://localhost:3100
```

### Option 2 : Kubernetes (Minikube)

```bash
# 1. Démarrer Minikube
minikube start --cpus=4 --memory=8192 --disk-size=20g

# 2. Déployer l'observabilité
./scripts/setup-observability.sh

# 3. Déployer l'application
./scripts/deploy-application.sh

# 4. Accès
- Frontend: http://$(minikube ip):30080
- Grafana: http://$(minikube ip):30300 (admin/admin)

# 5. Port-forwarding pour les autres services
kubectl port-forward -n observability svc/prometheus 9090:9090
kubectl port-forward -n observability svc/tempo 3200:3200
kubectl port-forward -n observability svc/loki 3100:3100
```

---

## 📁 Structure du Projet

```
tp2devops/
├── backend/                    # API Express avec OpenTelemetry
│   ├── server.js              # Point d'entrée
│   ├── tracing.js             # Configuration OpenTelemetry
│   ├── logger.js              # Logger structuré (Pino)
│   ├── metrics.js             # Métriques Prometheus
│   └── Dockerfile
│
├── src/                        # Frontend React
│   ├── components/
│   │   └── TodoList.jsx
│   └── observability/         # (Legacy - remplacé par backend)
│
├── k8s/                        # Manifests Kubernetes
│   ├── namespace.yaml
│   ├── otel-collector.yaml    # OpenTelemetry Collector
│   ├── prometheus-operator.yaml
│   ├── loki-stack.yaml        # Loki + Promtail
│   ├── tempo.yaml
│   ├── grafana.yaml
│   └── application.yaml       # Frontend + Backend
│
├── config/                     # Configurations
│   ├── tempo.yaml
│   ├── prometheus.yml
│   ├── grafana-datasources.yml
│   └── otel-collector-config.yaml
│
├── scripts/                    # Scripts de déploiement
│   ├── setup-observability.sh
│   ├── deploy-application.sh
│   └── cleanup.sh
│
├── .github/workflows/
│   └── ci.yml                 # CI/CD Pipeline
│
├── docker-compose.yml         # Stack complète local
├── OBSERVABILITY.md           # Documentation détaillée
└── README.md                  # Ce fichier
```

---

## 🔍 Les 3 Piliers de l'Observabilité

### 1. Métriques (Prometheus)

**Métriques HTTP** :
- `tp2devops_http_requests_total` - Compteur de requêtes
- `tp2devops_http_request_duration_seconds` - Histogramme de latence

**Métriques Métier** :
- `tp2devops_todo_operations_total` - Opérations CRUD
- `tp2devops_todos_active` - Todos actifs
- `tp2devops_todos_completed` - Todos complétés

**Accès** :
```bash
# Prometheus UI
kubectl port-forward -n observability svc/prometheus 9090:9090
open http://localhost:9090

# Endpoint metrics du backend
curl http://localhost:3001/metrics
```

### 2. Logs (Loki + Promtail)

**Format de logs** (JSON structuré) :
```json
{
  "level": "INFO",
  "time": "2025-10-19T16:30:00.000Z",
  "msg": "Todo created",
  "todoId": 123,
  "text": "Example todo",
  "traceId": "a1b2c3d4..."
}
```

**Collection** :
- **Promtail** (DaemonSet) collecte les logs de tous les pods
- Labels automatiques : `namespace`, `pod`, `container`
- Envoi vers **Loki** pour stockage et requête

**Requêtes LogQL** :
```logql
# Tous les logs du backend
{namespace="tp2devops", app="backend"}

# Logs d'erreur
{namespace="tp2devops"} |= "ERROR"

# Logs avec trace ID
{namespace="tp2devops"} | json | traceId="abc123"
```

### 3. Traces (Tempo + OpenTelemetry)

**Instrumentation** :
- SDK OpenTelemetry dans le backend Node.js
- Auto-instrumentation de Express, HTTP
- Spans manuels pour la logique métier

**Exemple de trace** :
```
POST /api/todos (15ms)
├─ create_todo (12ms)
│  ├─ validation (1ms)
│  ├─ todo_creation (8ms)
│  └─ metrics_update (2ms)
└─ response (1ms)
```

**Corrélation** :
- Chaque log contient un `traceId`
- Grafana permet de naviguer : Trace → Logs → Metrics

---

## 📊 Visualisation dans Grafana

### Datasources Configurées

1. **Prometheus** - Métriques
2. **Loki** - Logs
3. **Tempo** - Traces

### Fonctionnalités

- **Explore** : Requêtes ad-hoc sur metrics/logs/traces
- **Dashboards** : Métriques de l'application
- **Trace to Logs** : Cliquer sur une trace → voir les logs
- **Logs to Trace** : Cliquer sur un traceId → voir la trace
- **Service Graph** : Visualisation des dépendances

### Accès Grafana

```bash
# Kubernetes
open http://$(minikube ip):30300

# Docker Compose
open http://localhost:3000

# Credentials
Username: admin
Password: admin
```

---

## 🎯 Cas d'Usage

### Scénario 1 : Débug d'une Requête Lente

1. **Dashboard** : Voir latence p95 élevée
2. **Prometheus** : Identifier le endpoint lent
3. **Loki** : Chercher les logs de ce endpoint
4. **Tempo** : Analyser la trace complète
5. **Solution** : Identifier le span lent dans la trace

### Scénario 2 : Analyser une Erreur

1. **Loki** : Requête `|= "ERROR"`
2. Trouver le `traceId` dans le log
3. **Tempo** : Chercher la trace avec ce ID
4. **Flame Graph** : Voir où l'erreur s'est produite
5. **Logs** : Revenir aux logs détaillés

### Scénario 3 : Monitoring des Todos

1. **Dashboard** : Voir métriques en temps réel
   - Nombre de todos actifs
   - Taux de création
   - Taux de complétion
2. **Alertes** : (À configurer) sur seuils

---

## 🛠️ Développement

### Backend

```bash
cd backend

# Installer les dépendances
npm install

# Démarrer en dev
npm run dev

# Tester
curl http://localhost:3000/health
curl http://localhost:3000/metrics
curl http://localhost:3000/api/todos
```

### Frontend

```bash
# Installer les dépendances
npm install

# Démarrer en dev
npm run dev

# Build
npm run build
```

### Tests

```bash
# Tests unitaires
npm test

# Coverage
npm run test:coverage
```

---

## 🔄 Pipeline CI/CD

### Workflow GitHub Actions

```yaml
1. Test
   - Linting
   - Tests unitaires
   
2. Build
   - Docker images (frontend + backend)
   - Push to registry
   
3. Deploy
   - Deploy to Kubernetes
   - Smoke tests
```

**Fichier** : `.github/workflows/ci.yml`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | Ce fichier - Vue d'ensemble |
| `OBSERVABILITY.md` | Documentation détaillée de l'observabilité |
| `RAPPORT.md` | Rapport technique complet (français) |
| `docs/DEPLOIEMENT_GITHUB.md` | Guide de déploiement GitHub Pages |
| `docs/ARCHITECTURE.md` | Diagrammes d'architecture |

---

## 🧪 Test de la Stack

### Générer du Trafic

```bash
# Script de test
for i in {1..100}; do
  curl -X POST http://localhost:3001/api/todos \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Todo $i\"}"
  sleep 0.1
done
```

### Vérifier les Métriques

```bash
# Prometheus
curl http://localhost:9090/api/v1/query?query=tp2devops_http_requests_total

# Backend metrics endpoint
curl http://localhost:3001/metrics
```

### Voir les Logs

```bash
# Kubernetes
kubectl logs -n tp2devops -l app=backend --tail=50 -f

# Docker Compose
docker-compose logs -f backend
```

---

## 🐛 Troubleshooting

### Métriques manquantes

```bash
# Vérifier ServiceMonitor
kubectl get servicemonitor -n tp2devops

# Vérifier targets Prometheus
kubectl port-forward -n observability svc/prometheus 9090:9090
# → http://localhost:9090/targets
```

### Logs non visibles

```bash
# Vérifier Promtail
kubectl logs -n observability -l app=promtail

# Vérifier Loki
kubectl logs -n observability -l app=loki

# Tester connexion
curl http://localhost:3100/ready
```

### Traces absentes

```bash
# Vérifier OpenTelemetry Collector
kubectl logs -n observability -l app=otel-collector

# Vérifier backend logs
kubectl logs -n tp2devops -l app=backend | grep -i telemetry
```

---

## 🎓 Concepts Clés

### Pourquoi OpenTelemetry Collector ?

✅ **Découplage** : App → Collector → Backends  
✅ **Flexibilité** : Changer de backend sans modifier l'app  
✅ **Reliability** : Buffering, retry automatique  
✅ **Processing** : Sampling, filtering, enrichment  

### Pourquoi Prometheus Operator ?

✅ **CRDs** : Configuration déclarative (`ServiceMonitor`, `PrometheusRule`)  
✅ **Auto-discovery** : Détection automatique des endpoints  
✅ **GitOps** : Tout en YAML versionné  

### Corrélation Logs-Traces

```javascript
// Backend injecte le traceId dans chaque log
const traceId = trace.getSpan(context.active())?.spanContext().traceId;
logger.info({ msg: "...", traceId });
```

Grafana utilise ce `traceId` pour naviguer entre logs et traces.

---

## 📈 Métriques Importantes

### RED Method (Requests, Errors, Duration)

- **Requests** : `rate(tp2devops_http_requests_total[5m])`
- **Errors** : `rate(tp2devops_http_requests_total{status_code=~"5.."}[5m])`
- **Duration** : `histogram_quantile(0.95, rate(tp2devops_http_request_duration_seconds_bucket[5m]))`

### USE Method (Utilization, Saturation, Errors)

- **CPU** : `rate(process_cpu_user_seconds_total[5m])`
- **Memory** : `nodejs_heap_size_used_bytes`
- **Event Loop** : `nodejs_eventloop_lag_seconds`

---

## 🚀 Améliorations Possibles

- [ ] Alerting avec Alertmanager
- [ ] Service Mesh (Istio) pour tracing automatique
- [ ] Distributed tracing entre microservices
- [ ] Log sampling pour réduire le volume
- [ ] Dashboards Grafana avancés
- [ ] SLO/SLI tracking
- [ ] Exemplars (lien metrics → traces)

---

## 📖 Références

- [OpenTelemetry](https://opentelemetry.io/)
- [Prometheus](https://prometheus.io/)
- [Grafana Loki](https://grafana.com/oss/loki/)
- [Grafana Tempo](https://grafana.com/oss/tempo/)
- [Prometheus Operator](https://prometheus-operator.dev/)

---

## 👥 Auteur

TP2 DevOps - 2025

## 📄 Licence

MIT

---

**Stack d'observabilité production-ready avec Prometheus, Loki, Tempo et OpenTelemetry ! 🚀**

