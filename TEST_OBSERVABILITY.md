# 🧪 Guide de Test - Stack d'Observabilité Locale

## 🚀 Méthode 1 : Docker Compose (Recommandé pour Test Rapide)

### Étape 1 : Démarrer le Stack

```bash
cd /Users/theysaid/work/tp2devops

# Démarrer tous les services
docker-compose up -d

# Voir les logs en temps réel
docker-compose logs -f
```

**Temps de démarrage** : ~2 minutes

### Étape 2 : Vérifier que Tout Fonctionne

```bash
# Vérifier le statut des containers
docker-compose ps

# Devrait afficher :
# otel-collector   - running
# tempo            - running
# loki             - running
# prometheus       - running
# grafana          - running
# backend          - running
# frontend         - running
```

### Étape 3 : Accéder aux Services

| Service         | URL                   | Credentials |
| --------------- | --------------------- | ----------- |
| **Frontend**    | http://localhost:5173 | -           |
| **Backend API** | http://localhost:3001 | -           |
| **Grafana** 📊  | http://localhost:3000 | admin/admin |
| **Prometheus**  | http://localhost:9090 | -           |
| **Loki**        | http://localhost:3100 | -           |
| **Tempo**       | http://localhost:3200 | -           |

### Étape 4 : Générer du Trafic

```bash
# Test health check
curl http://localhost:3001/health

# Créer des todos
for i in {1..20}; do
  curl -X POST http://localhost:3001/api/todos \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"Todo numéro $i\"}"
  echo ""
  sleep 0.5
done

# Lister les todos
curl http://localhost:3001/api/todos

# Compléter un todo
curl -X PUT http://localhost:3001/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Supprimer un todo
curl -X DELETE http://localhost:3001/api/todos/2
```

---

## 📊 Test 1 : Vérifier les Métriques (Prometheus)

### 1. Ouvrir Prometheus

```bash
open http://localhost:9090
```

### 2. Tester les Requêtes

Dans l'interface Prometheus, exécutez ces requêtes :

```promql
# Nombre de requêtes HTTP par seconde
rate(tp2devops_http_requests_total[1m])

# Latence P95 des requêtes
histogram_quantile(0.95,
  rate(tp2devops_http_request_duration_seconds_bucket[5m])
)

# Todos actifs
tp2devops_todos_active

# Todos complétés
tp2devops_todos_completed

# Taux d'erreurs
rate(tp2devops_http_requests_total{status_code=~"5.."}[5m])
```

### 3. Voir les Targets

```bash
open http://localhost:9090/targets
```

Devrait afficher :

- ✅ `backend` - UP
- ✅ `otel-collector` - UP
- ✅ `prometheus` - UP

---

## 📝 Test 2 : Vérifier les Logs (Loki via Grafana)

### 1. Ouvrir Grafana

```bash
open http://localhost:3000
```

**Login** : admin/admin

### 2. Aller dans Explore

- Cliquer sur l'icône **boussole** (Explore)
- Sélectionner datasource **Loki**

### 3. Requêtes LogQL à Tester

```logql
# Tous les logs du backend
{container="backend"}

# Logs d'info uniquement
{container="backend"} | json | level="INFO"

# Logs d'erreur (si vous en générez)
{container="backend"} | json | level="ERROR"

# Logs contenant "Todo"
{container="backend"} |= "Todo"

# Logs avec traceId
{container="backend"} | json | traceId!=""
```

### 4. Vérifier la Structure des Logs

Les logs devraient être en format JSON :

```json
{
  "level": "INFO",
  "time": "2025-10-19T18:30:00.000Z",
  "msg": "Todo created",
  "todoId": 123,
  "text": "Test todo",
  "traceId": "abc123..."
}
```

---

## 🔍 Test 3 : Vérifier les Traces (Tempo)

### 1. Dans Grafana Explore

- Sélectionner datasource **Tempo**

### 2. Rechercher des Traces

**Option A : Search**

- Service Name : `tp2devops-backend`
- Operation : Laisser vide ou choisir `create_todo`, `update_todo`, etc.
- Cliquer sur **Run Query**

**Option B : TraceQL**

```traceql
# Toutes les traces
{ resource.service.name = "tp2devops-backend" }

# Traces avec latence > 10ms
{ duration > 10ms }

# Traces de création de todo
{ name = "create_todo" }
```

### 3. Analyser une Trace

Cliquer sur une trace pour voir :

- 🔥 **Flame Graph** : Visualisation hiérarchique des spans
- 📊 **Span List** : Liste détaillée avec durées
- 📝 **Attributes** : Métadonnées (todoId, status_code, etc.)

### 4. Tester la Correlation Traces → Logs

1. Sélectionner une trace
2. Cliquer sur **"Logs for this span"**
3. ✨ Grafana devrait automatiquement :
   - Passer à Loki
   - Filtrer par le `traceId` de la trace
   - Afficher les logs correspondants

---

## 🔗 Test 4 : Vérifier la Corrélation Complète

### Workflow : Metrics → Logs → Traces

1. **Prometheus** : Observer une latence élevée

   ```promql
   histogram_quantile(0.95, rate(tp2devops_http_request_duration_seconds_bucket[5m]))
   ```

2. **Loki** : Chercher les logs avec haute latence

   ```logql
   {container="backend"} | json | duration > 50
   ```

3. **Copier un `traceId`** depuis les logs

4. **Tempo** : Chercher la trace

   - Explore → Tempo → Trace ID → Coller le traceId

5. **Analyser** le flame graph pour voir quel span est lent

---

## 🧪 Test 5 : OpenTelemetry Collector

### Vérifier que le Collector fonctionne

```bash
# Voir les logs du collector
docker-compose logs otel-collector

# Devrait afficher des messages comme :
# "Traces exported successfully"
# "Metrics exported successfully"
# "Logs exported successfully"
```

### Tester l'endpoint OTLP

```bash
# Vérifier que le collector écoute
curl http://localhost:8888/metrics

# Devrait retourner des métriques du collector lui-même
```

---

## 📈 Test 6 : Dashboard Grafana

### Importer un Dashboard

1. Grafana → **Dashboards** → **New** → **Import**

2. Uploader le fichier :

   ```bash
   k8s/grafana-dashboards/application-dashboard.json
   ```

3. Ou créer un nouveau dashboard avec ces panels :

**Panel 1 : HTTP Request Rate**

```promql
rate(tp2devops_http_requests_total[5m])
```

**Panel 2 : HTTP Request Duration (P95)**

```promql
histogram_quantile(0.95, rate(tp2devops_http_request_duration_seconds_bucket[5m]))
```

**Panel 3 : Active Todos (Stat)**

```promql
tp2devops_todos_active
```

**Panel 4 : Recent Logs (Logs panel)**

```logql
{container="backend"} | json
```

---

## 🔧 Test 7 : Vérifications Techniques

### Backend - Endpoint Métriques

```bash
# Voir les métriques Prometheus du backend
curl http://localhost:3001/metrics

# Devrait afficher :
# tp2devops_http_requests_total
# tp2devops_http_request_duration_seconds
# tp2devops_todos_active
# tp2devops_todos_completed
# etc.
```

### Backend - Logs Structurés

```bash
# Voir les logs du backend en temps réel
docker-compose logs -f backend

# Devrait afficher des logs JSON :
# {"level":"INFO","time":"...","msg":"Todo created",...}
```

### Loki - API

```bash
# Vérifier que Loki est prêt
curl http://localhost:3100/ready

# Requête manuelle à Loki
curl -G -s "http://localhost:3100/loki/api/v1/query" \
  --data-urlencode 'query={container="backend"}' \
  --data-urlencode 'limit=10' | jq .
```

### Tempo - API

```bash
# Vérifier que Tempo est prêt
curl http://localhost:3200/ready

# Rechercher des traces (nécessite un traceId)
# curl http://localhost:3200/api/traces/<traceId>
```

---

## 🎯 Checklist de Validation Complète

### ✅ Services Démarrés

- [ ] `docker-compose ps` affiche tous les services "Up"
- [ ] Pas d'erreurs dans `docker-compose logs`

### ✅ Backend Fonctionnel

- [ ] Health check : `curl http://localhost:3001/health`
- [ ] Création de todo fonctionne
- [ ] Endpoint metrics accessible : `curl http://localhost:3001/metrics`

### ✅ Prometheus

- [ ] UI accessible : http://localhost:9090
- [ ] Targets en UP : http://localhost:9090/targets
- [ ] Métriques `tp2devops_*` visibles
- [ ] Requêtes PromQL fonctionnent

### ✅ Loki

- [ ] API répond : `curl http://localhost:3100/ready`
- [ ] Logs visibles dans Grafana Explore
- [ ] Logs sont en JSON
- [ ] LogQL queries fonctionnent

### ✅ Tempo

- [ ] API répond : `curl http://localhost:3200/ready`
- [ ] Traces visibles dans Grafana Explore
- [ ] Flame graphs s'affichent
- [ ] TraceQL queries fonctionnent

### ✅ Grafana

- [ ] UI accessible : http://localhost:3000
- [ ] Login fonctionne (admin/admin)
- [ ] 3 datasources configurées et fonctionnelles
- [ ] Explore fonctionne pour chaque datasource
- [ ] Correlation Traces → Logs fonctionne

### ✅ OpenTelemetry Collector

- [ ] Logs montrent export réussi
- [ ] Métriques du collector accessibles : http://localhost:8888/metrics
- [ ] Pas d'erreurs dans les logs

---

## 🐛 Dépannage

### Services ne démarrent pas

```bash
# Voir les erreurs
docker-compose logs <service-name>

# Exemples :
docker-compose logs backend
docker-compose logs otel-collector
docker-compose logs tempo
```

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port
lsof -i :3000  # Pour Grafana
lsof -i :3001  # Pour Backend

# Tuer le processus
kill -9 <PID>
```

### Pas de métriques dans Prometheus

```bash
# Vérifier que le backend expose les métriques
curl http://localhost:3001/metrics

# Vérifier les targets Prometheus
open http://localhost:9090/targets

# Si backend n'est pas dans les targets, vérifier prometheus.yml
```

### Pas de logs dans Loki

```bash
# Docker Compose n'utilise pas Promtail
# Les logs viennent directement du backend

# Vérifier les logs backend
docker-compose logs backend

# Si pas de logs JSON, vérifier la config du backend
```

### Pas de traces dans Tempo

```bash
# Vérifier OpenTelemetry Collector
docker-compose logs otel-collector | grep -i error

# Vérifier configuration
cat config/otel-collector-config.yaml

# Vérifier que le backend envoie bien
docker-compose logs backend | grep -i "telemetry\|trace"
```

---

## 🔄 Redémarrer les Services

```bash
# Redémarrer un service spécifique
docker-compose restart backend

# Redémarrer tout
docker-compose restart

# Redémarrer avec rebuild
docker-compose up -d --build

# Tout arrêter et redémarrer
docker-compose down
docker-compose up -d
```

---

## 🧹 Nettoyer et Recommencer

```bash
# Arrêter tous les services
docker-compose down

# Supprimer les volumes (données perdues !)
docker-compose down -v

# Supprimer les images
docker-compose down --rmi all

# Tout nettoyer et redémarrer
docker-compose down -v
docker-compose up -d --build
```

---

## 📊 Scénarios de Test Avancés

### Scénario 1 : Simuler une Erreur

```bash
# Créer un todo vide (devrait échouer)
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'

# Vérifier dans les logs
docker-compose logs backend | grep -i "warn\|error"

# Vérifier dans Loki
# Grafana → Loki → {container="backend"} |= "WARN"
```

### Scénario 2 : Load Test

```bash
# Installer hey (load testing tool)
# brew install hey

# Générer du load
hey -n 1000 -c 10 -m POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Load test todo"}' \
  http://localhost:3001/api/todos

# Observer dans Grafana :
# - Augmentation du request rate
# - Latence P95
# - Nombre de todos actifs
```

### Scénario 3 : Suivre une Requête de Bout en Bout

1. **Créer un todo**

   ```bash
   curl -X POST http://localhost:3001/api/todos \
     -H "Content-Type: application/json" \
     -d '{"text":"Test correlation"}'
   ```

2. **Voir les métriques**

   - Prometheus : `tp2devops_todo_operations_total{operation="create"}`

3. **Trouver le log**

   - Loki : `{container="backend"} |= "Test correlation"`
   - Noter le `traceId`

4. **Voir la trace**

   - Tempo : Chercher par traceId
   - Analyser le flame graph

5. **Retour aux logs depuis la trace**
   - Cliquer "Logs for this span"
   - Voir tous les logs de cette requête

---

## ✅ Test Réussi Si...

Vous avez réussi si vous pouvez :

1. ✅ Créer des todos via l'API
2. ✅ Voir les métriques dans Prometheus
3. ✅ Voir les logs dans Grafana/Loki
4. ✅ Voir les traces dans Grafana/Tempo
5. ✅ Naviguer d'une trace à ses logs
6. ✅ Voir les 3 datasources vertes dans Grafana

---

**🎉 Félicitations ! Votre stack d'observabilité fonctionne ! 🎉**
