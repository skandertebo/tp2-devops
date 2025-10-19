# Solution d'Observabilité Complète - TP2 DevOps

## 🎯 Architecture d'Observabilité

Cette solution implémente les **trois piliers de l'observabilité** avec un stack production-ready :

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION                                  │
│  ┌──────────────┐              ┌──────────────┐                     │
│  │   Frontend   │──────────────│   Backend    │                     │
│  │   (React)    │     HTTP     │   (Express)  │                     │
│  └──────────────┘              └──────┬───────┘                     │
│                                       │                             │
│                              OpenTelemetry SDK                      │
│                                       │                             │
└───────────────────────────────────────┼─────────────────────────────┘
                                        │
                                        ▼
                    ┌──────────────────────────────────┐
                    │   OpenTelemetry Collector        │
                    │  - Receive: OTLP (gRPC/HTTP)     │
                    │  - Process: Batch, Filter        │
                    │  - Export: Multiple backends     │
                    └────────┬────────┬────────────────┘
                             │        │        │
          ┌──────────────────┘        │        └──────────────────┐
          ▼                           ▼                           ▼
    ┌─────────┐               ┌──────────┐              ┌──────────┐
    │  TEMPO  │               │   LOKI   │              │PROMETHEUS│
    │ Tracing │               │   Logs   │              │ Metrics  │
    └────┬────┘               └─────┬────┘              └────┬─────┘
         │                          │                        │
         │          ┌───────────────┼────────────────────────┘
         │          │               │                │
         └──────────┼───────────────┘                │
                    ▼                                ▼
              ┌─────────────┐              ┌────────────────┐
              │   GRAFANA   │◄─────────────│   PROMTAIL     │
              │ Visualization│              │ Log Collection │
              └─────────────┘              └────────────────┘
```

---

## 📊 Composants de la Stack

### 1. **OpenTelemetry Collector**
**Rôle** : Point d'entrée central pour toutes les données d'observabilité

**Configuration** :
- **Receivers** : OTLP (gRPC + HTTP sur ports 4317/4318)
- **Processors** : Batch, Memory Limiter, Resource Attribution
- **Exporters** :
  - Traces → Tempo
  - Metrics → Prometheus (Remote Write)
  - Logs → Loki

**Fichier** : `k8s/otel-collector.yaml`

**Pourquoi** : 
- Découplage entre applications et backends
- Permet de changer de backends sans modifier le code
- Buffering et retry automatique
- Traitement centralisé (sampling, filtering)

---

### 2. **Prometheus + Prometheus Operator**
**Rôle** : Collecte et stockage des métriques

**Caractéristiques** :
- **Prometheus Operator** : Gestion déclarative via CRDs (Custom Resource Definitions)
- **ServiceMonitor** : Découverte automatique des endpoints métriques
- **Remote Write** : Accepte les métriques de l'OpenTelemetry Collector
- **Retention** : 7 jours de données
- **Storage** : PVC 5Gi

**Métriques collectées** :
```prometheus
# HTTP Metrics
tp2devops_http_requests_total
tp2devops_http_request_duration_seconds

# Business Metrics
tp2devops_todo_operations_total{operation="create|update|delete|list"}
tp2devops_todos_active
tp2devops_todos_completed

# System Metrics
tp2devops_backend_nodejs_heap_size_used_bytes
tp2devops_backend_process_cpu_user_seconds_total
```

**Fichier** : `k8s/prometheus-operator.yaml`

**Accès** :
```bash
kubectl port-forward -n observability svc/prometheus 9090:9090
```

---

### 3. **Loki + Promtail**
**Rôle** : Agrégation et requête de logs

#### Loki
- **Backend de stockage** : Logs indexés par labels (pas par contenu)
- **Stockage** : Filesystem (local) avec PVC 5Gi
- **API** : Compatible LogQL (langage de requête)

#### Promtail
- **DaemonSet** : Un pod sur chaque nœud
- **Collecte** : Logs de tous les pods via `/var/log/pods`
- **Labels automatiques** :
  - `namespace`
  - `pod`
  - `container`
  - Labels Kubernetes

**Format de logs (Backend)** :
```json
{
  "level": "INFO",
  "time": "2025-10-19T16:30:00.000Z",
  "msg": "Todo created",
  "todoId": 123,
  "text": "Example todo"
}
```

**Requêtes LogQL exemples** :
```logql
# Tous les logs du namespace tp2devops
{namespace="tp2devops"}

# Logs d'erreur du backend
{namespace="tp2devops", app="backend"} |= "ERROR"

# Logs avec un trace ID spécifique
{namespace="tp2devops"} | json | traceId="abc123"

# Agrégation : taux d'erreurs
rate({namespace="tp2devops"} |= "ERROR" [5m])
```

**Fichier** : `k8s/loki-stack.yaml`

---

### 4. **Tempo**
**Rôle** : Stockage et requête des traces distribuées

**Caractéristiques** :
- **Protocole** : OTLP (OpenTelemetry Protocol)
- **Stockage** : Local filesystem avec PVC 10Gi
- **Retention** : 1 heure (configurable)
- **TraceQL** : Langage de requête pour les traces

**Structure d'une trace** :
```
Trace ID: a1b2c3d4e5f6...
├─ Span: HTTP POST /api/todos (15ms)
│  ├─ Span: create_todo (12ms)
│  │  ├─ Span: db_insert (8ms)
│  │  └─ Span: update_metrics (2ms)
│  └─ Span: log_operation (1ms)
└─ Attributes:
   ├─ http.method: POST
   ├─ http.route: /api/todos
   ├─ http.status_code: 201
   └─ todo.id: 123
```

**Intégration avec Loki** :
- Grafana peut afficher les logs associés à une trace
- Filtrage automatique par `traceId`

**Fichier** : `k8s/tempo.yaml`

**Accès** :
```bash
kubectl port-forward -n observability svc/tempo 3200:3200
```

---

### 5. **Grafana**
**Rôle** : Visualisation unifiée de toutes les données

**Datasources configurées** :
1. **Prometheus** - Métriques
2. **Loki** - Logs
3. **Tempo** - Traces

**Features activées** :
- **Trace to Logs** : Cliquer sur une trace → voir les logs
- **Trace to Metrics** : Cliquer sur une trace → voir les métriques
- **Logs to Traces** : Cliquer sur un traceId → voir la trace
- **Service Graph** : Visualisation des dépendances

**Dashboards** :
- Application Overview (métriques HTTP, business)
- Logs Explorer
- Trace Explorer

**Fichier** : `k8s/grafana.yaml`

**Accès** :
```bash
# Via NodePort
http://$(minikube ip):30300

# Credentials
Username: admin
Password: admin
```

---

## 🚀 Déploiement

### Prérequis

```bash
# Installer Minikube
brew install minikube

# Démarrer Minikube avec ressources suffisantes
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Installer kubectl
brew install kubectl
```

### Déploiement Complet

```bash
# 1. Déployer le stack d'observabilité
./scripts/setup-observability.sh

# 2. Builder et déployer l'application
./scripts/deploy-application.sh

# 3. Vérifier le déploiement
kubectl get all -n tp2devops
kubectl get all -n observability
```

### Ordre de Déploiement

1. ✅ Namespaces (`namespace.yaml`)
2. ✅ Prometheus Operator (bundle externe)
3. ✅ Prometheus (`prometheus-operator.yaml`)
4. ✅ Loki + Promtail (`loki-stack.yaml`)
5. ✅ Tempo (`tempo.yaml`)
6. ✅ OpenTelemetry Collector (`otel-collector.yaml`)
7. ✅ Grafana (`grafana.yaml`)
8. ✅ Application (Backend + Frontend) (`application.yaml`)

---

## 🔍 Utilisation

### 1. Générer du Trafic

```bash
# Obtenir l'URL de l'application
minikube service frontend -n tp2devops --url

# Ou accéder via NodePort
open http://$(minikube ip):30080
```

Interagir avec l'application :
- Créer des todos
- Les marquer comme complétées
- Les supprimer

### 2. Voir les Métriques dans Prometheus

```bash
kubectl port-forward -n observability svc/prometheus 9090:9090
open http://localhost:9090
```

Requêtes utiles :
```promql
# Taux de requêtes HTTP
rate(tp2devops_http_requests_total[5m])

# Latence p95
histogram_quantile(0.95, rate(tp2devops_http_request_duration_seconds_bucket[5m]))

# Nombre de todos actifs
tp2devops_todos_active
```

### 3. Explorer les Logs dans Grafana

```bash
open http://$(minikube ip):30300
```

1. Aller dans **Explore**
2. Sélectionner datasource **Loki**
3. Requête : `{namespace="tp2devops", app="backend"}`
4. Filtrer par niveau : `|= "INFO"` ou `|= "ERROR"`

### 4. Visualiser les Traces

1. Dans Grafana → **Explore**
2. Sélectionner datasource **Tempo**
3. **Search** → Filtrer par :
   - Service Name: `tp2devops-backend`
   - Operation: `create_todo`, `update_todo`, etc.
4. Cliquer sur une trace pour voir le détail
5. Cliquer sur "Logs for this span" pour corréler avec les logs

---

## 📈 Métriques Disponibles

### HTTP Metrics

| Métrique | Type | Description |
|----------|------|-------------|
| `tp2devops_http_requests_total` | Counter | Nombre total de requêtes HTTP par méthode, route, status |
| `tp2devops_http_request_duration_seconds` | Histogram | Durée des requêtes HTTP (buckets de 5ms à 5s) |

### Business Metrics

| Métrique | Type | Description |
|----------|------|-------------|
| `tp2devops_todo_operations_total` | Counter | Opérations sur les todos (create, update, delete, list) |
| `tp2devops_todos_active` | Gauge | Nombre de todos actifs (non complétés) |
| `tp2devops_todos_completed` | Gauge | Nombre de todos complétés |

### System Metrics (auto-collectées)

| Métrique | Type | Description |
|----------|------|-------------|
| `tp2devops_backend_nodejs_heap_size_used_bytes` | Gauge | Mémoire heap utilisée |
| `tp2devops_backend_process_cpu_user_seconds_total` | Counter | CPU user time |
| `tp2devops_backend_process_resident_memory_bytes` | Gauge | Mémoire résidente |

---

## 🔗 Corrélation Metrics-Logs-Traces

### Exemple de Workflow

1. **Détection d'un problème dans Grafana (Metrics)**
   - Dashboard montre une latence p95 élevée sur `/api/todos`

2. **Investigation dans les Logs**
   - Requête Loki : `{namespace="tp2devops"} |= "/api/todos" | json | duration > 100`
   - On trouve un `traceId` dans les logs

3. **Analyse détaillée dans les Traces**
   - Chercher la trace avec le `traceId`
   - Voir la flame graph : identifier le span lent
   - Voir les attributs : `db_insert` prend 95ms

4. **Retour aux Logs pour le contexte**
   - Depuis la trace, cliquer sur "Logs for this span"
   - Voir les logs précis de cette opération

---

## 🎯 Dashboards Grafana

### Dashboard "Application Overview"

**Panels** :
1. HTTP Requests Rate (Graph)
2. HTTP Request Duration p50/p95/p99 (Graph)
3. Active Todos (Stat)
4. Completed Todos (Stat)
5. Todo Operations Rate (Graph)
6. Error Rate (Graph)
7. Recent Logs (Logs panel)

**Fichier** : `k8s/grafana-dashboards/application-dashboard.json`

---

## 🛠️ Troubleshooting

### Les métriques n'apparaissent pas dans Prometheus

```bash
# Vérifier que le ServiceMonitor existe
kubectl get servicemonitor -n tp2devops

# Vérifier les targets dans Prometheus
kubectl port-forward -n observability svc/prometheus 9090:9090
# Aller sur http://localhost:9090/targets

# Vérifier les logs du backend
kubectl logs -n tp2devops -l app=backend | grep metrics
```

### Les logs ne sont pas dans Loki

```bash
# Vérifier Promtail
kubectl get pods -n observability -l app=promtail
kubectl logs -n observability -l app=promtail

# Vérifier Loki
kubectl logs -n observability -l app=loki

# Tester manuellement
kubectl port-forward -n observability svc/loki 3100:3100
curl http://localhost:3100/ready
```

### Les traces ne sont pas dans Tempo

```bash
# Vérifier l'OpenTelemetry Collector
kubectl logs -n observability -l app=otel-collector

# Vérifier Tempo
kubectl logs -n observability -l app=tempo

# Vérifier que le backend envoie bien les traces
kubectl logs -n tp2devops -l app=backend | grep -i "telemetry\|trace"
```

---

## 📚 Références

- [OpenTelemetry](https://opentelemetry.io/)
- [Prometheus Operator](https://prometheus-operator.dev/)
- [Grafana Loki](https://grafana.com/oss/loki/)
- [Grafana Tempo](https://grafana.com/oss/tempo/)
- [Grafana](https://grafana.com/docs/grafana/latest/)

---

## 🎓 Concepts Clés

### Pourquoi OpenTelemetry Collector ?

**Sans Collector** :
```
Application → Tempo
Application → Prometheus
Application → Loki
```
❌ Couplage fort  
❌ Configuration complexe  
❌ Pas de retry/buffering  

**Avec Collector** :
```
Application → OTel Collector → Tempo/Prometheus/Loki
```
✅ Un seul endpoint  
✅ Changement de backend facile  
✅ Buffering automatique  
✅ Traitement centralisé  

### Pourquoi Prometheus Operator ?

**Sans Operator** :
- Configuration manuelle de Prometheus
- Redémarrage pour ajouter des targets
- Gestion manuelle des ConfigMaps

**Avec Operator** :
- CRDs : `Prometheus`, `ServiceMonitor`, `PrometheusRule`
- Découverte automatique via labels
- Reconfiguration automatique

### Correlation Logs-Traces

**Dans le code backend** :
```javascript
const traceId = trace.getSpan(context.active())?.spanContext().traceId;
logger.info({ msg: "...", traceId: traceId });
```

**Dans Grafana** :
- Loki configure automatiquement le champ `traceId`
- Tempo sait chercher dans Loki avec ce `traceId`
- Clic dans UI → corrélation automatique

---

**Stack d'observabilité complète et production-ready ! 🚀**

