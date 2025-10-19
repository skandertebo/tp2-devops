# 🚀 Quick Start - Observabilité Complète

## Choisissez Votre Méthode de Démarrage

### Option 1 : Docker Compose (Le Plus Rapide) ⚡

```bash
# 1. Démarrer toute la stack
docker-compose up -d

# 2. Attendre que tout démarre (~2 minutes)
docker-compose logs -f

# 3. Accéder aux services
```

**URLs** :
- 🌐 **Frontend** : http://localhost:5173
- 🔧 **Backend API** : http://localhost:3001
- 📊 **Grafana** : http://localhost:3000 (admin/admin)
- 📈 **Prometheus** : http://localhost:9090
- 📝 **Loki** : http://localhost:3100
- 🔍 **Tempo** : http://localhost:3200

**Tester** :
```bash
# Health check backend
curl http://localhost:3001/health

# Créer un todo
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Test todo"}'

# Voir les métriques
curl http://localhost:3001/metrics
```

---

### Option 2 : Kubernetes avec Minikube 🐳

```bash
# 1. Démarrer Minikube (si pas déjà fait)
minikube start --cpus=4 --memory=8192 --disk-size=20g

# 2. Installer le stack d'observabilité
./scripts/setup-observability.sh

# 3. Déployer l'application
./scripts/deploy-application.sh

# 4. Obtenir les URLs
echo "Frontend: http://$(minikube ip):30080"
echo "Grafana: http://$(minikube ip):30300"
```

**Port-forwarding** pour les autres services :
```bash
# Dans des terminaux séparés
kubectl port-forward -n observability svc/prometheus 9090:9090
kubectl port-forward -n observability svc/loki 3100:3100
kubectl port-forward -n observability svc/tempo 3200:3200
kubectl port-forward -n tp2devops svc/backend 3001:3000
```

---

## 📊 Explorer l'Observabilité

### 1. Générer du Trafic

```bash
# Script pour générer des requêtes
for i in {1..50}; do
  curl -X POST http://localhost:3001/api/todos \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Todo $i\"}"
  sleep 0.2
done
```

### 2. Voir les Métriques dans Prometheus

```bash
open http://localhost:9090
```

**Requêtes utiles** :
```promql
# Taux de requêtes HTTP
rate(tp2devops_http_requests_total[5m])

# Latence P95
histogram_quantile(0.95, rate(tp2devops_http_request_duration_seconds_bucket[5m]))

# Todos actifs
tp2devops_todos_active
```

### 3. Explorer les Logs dans Grafana

```bash
open http://localhost:3000  # admin/admin
```

1. Aller dans **Explore** (icône boussole)
2. Sélectionner datasource **Loki**
3. Requête : `{namespace="tp2devops", app="backend"}`
4. Voir les logs structurés JSON

**Filtres utiles** :
```logql
{namespace="tp2devops"} |= "ERROR"
{namespace="tp2devops"} | json | level="INFO"
{namespace="tp2devops"} | json | traceId="..."
```

### 4. Analyser les Traces dans Tempo

1. Dans Grafana → **Explore**
2. Sélectionner datasource **Tempo**
3. Cliquer sur **Search**
4. Service Name : `tp2devops-backend`
5. Cliquer sur une trace pour voir le détail

**Navigation** :
- 🔥 **Flame Graph** : Visualisation hiérarchique des spans
- 📊 **Span List** : Liste détaillée avec durées
- 📝 **Logs** : Cliquer sur "Logs for this span"

### 5. Dashboard Application

1. Grafana → **Dashboards**
2. Import dashboard :
   - ID : `k8s/grafana-dashboards/application-dashboard.json`
3. Voir :
   - HTTP Request Rate
   - HTTP Request Duration (P50/P95/P99)
   - Active Todos
   - Completed Todos
   - Recent Logs

---

## 🔍 Workflow de Debugging

### Scénario : Trouver une Requête Lente

1. **Dashboard** → Voir P95 latency élevée

2. **Loki** → Chercher les requêtes lentes :
   ```logql
   {namespace="tp2devops", app="backend"} 
     | json 
     | duration > 100
   ```

3. **Copier le `traceId`** depuis un log

4. **Tempo** → Rechercher la trace :
   ```
   Explore → Tempo → Search → Trace ID: <paste>
   ```

5. **Flame Graph** → Identifier le span lent

6. **Logs** → Revenir aux logs détaillés :
   - Cliquer sur "Logs for this span"

---

## 🛠️ Commandes Utiles

### Docker Compose

```bash
# Voir tous les containers
docker-compose ps

# Logs d'un service
docker-compose logs -f backend

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Tout nettoyer (y compris volumes)
docker-compose down -v
```

### Kubernetes

```bash
# Voir tous les pods
kubectl get pods -A

# Logs du backend
kubectl logs -n tp2devops -l app=backend --tail=50 -f

# Logs de l'OpenTelemetry Collector
kubectl logs -n observability -l app=otel-collector -f

# Exec dans un pod
kubectl exec -it -n tp2devops deploy/backend -- /bin/sh

# Vérifier les métriques du backend
kubectl exec -n tp2devops deploy/backend -- curl -s localhost:3000/metrics

# Nettoyer tout
./scripts/cleanup.sh
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README_OBSERVABILITY.md` | 📖 Vue d'ensemble complète |
| `OBSERVABILITY.md` | 🔧 Documentation technique détaillée |
| `DEPLOYMENT_GUIDE.md` | 🚀 Guide de déploiement complet |
| `COMPLETE_OBSERVABILITY_SUMMARY.md` | 📊 Résumé exécutif |
| `QUICK_START.md` | ⚡ Ce fichier |

---

## 🎯 Checklist de Validation

### ✅ Vérifier que tout fonctionne

**Backend** :
- [ ] Health check OK : `curl http://localhost:3001/health`
- [ ] Metrics disponibles : `curl http://localhost:3001/metrics`
- [ ] CRUD fonctionne : créer/lister/modifier/supprimer todos

**Prometheus** :
- [ ] UI accessible : http://localhost:9090
- [ ] Targets UP : http://localhost:9090/targets
- [ ] Métriques visibles : rechercher `tp2devops_`

**Loki** :
- [ ] API répond : `curl http://localhost:3100/ready`
- [ ] Logs visibles dans Grafana Explore

**Tempo** :
- [ ] API répond : `curl http://localhost:3200/ready`
- [ ] Traces visibles dans Grafana Explore

**Grafana** :
- [ ] Login fonctionne : admin/admin
- [ ] 3 datasources configurées
- [ ] Explore fonctionne pour Prometheus/Loki/Tempo
- [ ] Correlation Traces → Logs fonctionne

---

## 🐛 Dépannage Rapide

### Services ne démarrent pas

```bash
# Docker Compose
docker-compose logs <service-name>

# Kubernetes
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

### Pas de métriques

```bash
# Vérifier endpoint
curl http://localhost:3001/metrics

# Kubernetes: vérifier ServiceMonitor
kubectl get servicemonitor -n tp2devops
kubectl describe servicemonitor backend-metrics -n tp2devops
```

### Pas de logs dans Loki

```bash
# Docker Compose: vérifier Promtail (n'existe pas en compose, logs directs)
docker-compose logs backend

# Kubernetes: vérifier Promtail
kubectl logs -n observability daemonset/promtail
```

### Pas de traces dans Tempo

```bash
# Vérifier OpenTelemetry Collector
docker-compose logs otel-collector
# ou
kubectl logs -n observability -l app=otel-collector

# Vérifier backend envoie bien
docker-compose logs backend | grep -i "telemetry\|trace"
```

---

## 💡 Conseils

1. **Générez du trafic** pour voir les données
2. **Explorez dans Grafana** - c'est l'interface principale
3. **Utilisez la correlation** - passez de traces → logs → metrics
4. **Consultez la doc** quand vous êtes bloqué

---

## 🎉 C'est Parti !

```bash
# Démarrer la stack
docker-compose up -d

# Attendre 2 minutes
sleep 120

# Ouvrir Grafana
open http://localhost:3000

# Login: admin/admin
# Aller dans Explore et commencer à explorer !
```

**Amusez-vous avec l'observabilité ! 🚀📊🔍**

