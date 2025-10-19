# Guide de Déploiement Complet

## 🎯 Options de Déploiement

Ce projet peut être déployé de 3 façons différentes :

1. **Docker Compose** - Pour le développement local
2. **Minikube/Kind** - Pour tester Kubernetes en local
3. **Cluster Kubernetes** - Pour la production

---

## 1. Docker Compose (Développement Local)

### Prérequis

- Docker Desktop installé
- Docker Compose v2.x

### Déploiement

```bash
# Démarrer toute la stack
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Nettoyer tout (y compris les volumes)
docker-compose down -v
```

### Services Disponibles

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Application React |
| Backend | http://localhost:3001 | API Express |
| Grafana | http://localhost:3000 | Visualisation (admin/admin) |
| Prometheus | http://localhost:9090 | Métriques |
| Loki | http://localhost:3100 | Logs |
| Tempo | http://localhost:3200 | Traces |

### Vérifications

```bash
# Backend health check
curl http://localhost:3001/health

# Backend metrics
curl http://localhost:3001/metrics

# Loki ready
curl http://localhost:3100/ready

# Prometheus targets
open http://localhost:9090/targets
```

---

## 2. Minikube (Kubernetes Local)

### Prérequis

```bash
# Installer Minikube
brew install minikube

# Installer kubectl
brew install kubectl
```

### Démarrage de Minikube

```bash
# Démarrer avec ressources suffisantes
minikube start \\
  --cpus=4 \\
  --memory=8192 \\
  --disk-size=20g \\
  --driver=docker

# Vérifier
minikube status
kubectl cluster-info
```

### Déploiement Automatique

```bash
# 1. Déployer l'observabilité
./scripts/setup-observability.sh

# 2. Builder et déployer l'application
./scripts/deploy-application.sh
```

### Déploiement Manuel

```bash
# 1. Créer les namespaces
kubectl apply -f k8s/namespace.yaml

# 2. Installer Prometheus Operator
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.70.0/bundle.yaml

# Attendre que l'operator soit prêt
kubectl wait --for=condition=Ready pods -l app.kubernetes.io/name=prometheus-operator -n default --timeout=300s

# 3. Déployer Prometheus
kubectl apply -f k8s/prometheus-operator.yaml

# 4. Déployer Loki + Promtail
kubectl apply -f k8s/loki-stack.yaml

# 5. Déployer Tempo
kubectl apply -f k8s/tempo.yaml

# 6. Déployer OpenTelemetry Collector
kubectl apply -f k8s/otel-collector.yaml

# 7. Déployer Grafana
kubectl apply -f k8s/grafana.yaml

# 8. Attendre que tout soit prêt
kubectl wait --for=condition=Ready pods -l app=loki -n observability --timeout=300s
kubectl wait --for=condition=Ready pods -l app=tempo -n observability --timeout=300s
kubectl wait --for=condition=Ready pods -l app=otel-collector -n observability --timeout=300s
kubectl wait --for=condition=Ready pods -l app=grafana -n observability --timeout=300s

# 9. Builder les images Docker (dans le démon Docker de Minikube)
eval $(minikube docker-env)

docker build -t tp2devops-backend:latest -f backend/Dockerfile backend/
docker build -t tp2devops-frontend:latest -f Dockerfile .

# 10. Déployer l'application
kubectl apply -f k8s/application.yaml

# 11. Attendre que l'application soit prête
kubectl wait --for=condition=Ready pods -l app=backend -n tp2devops --timeout=300s
kubectl wait --for=condition=Ready pods -l app=frontend -n tp2devops --timeout=300s
```

### Accès aux Services

```bash
# Obtenir l'IP de Minikube
minikube ip

# Frontend
open http://$(minikube ip):30080

# Grafana
open http://$(minikube ip):30300

# Port-forwarding pour les autres services
kubectl port-forward -n observability svc/prometheus 9090:9090 &
kubectl port-forward -n observability svc/loki 3100:3100 &
kubectl port-forward -n observability svc/tempo 3200:3200 &
kubectl port-forward -n tp2devops svc/backend 3001:3000 &
```

### Vérifications

```bash
# Voir tous les pods
kubectl get pods -A

# Pods de l'application
kubectl get pods -n tp2devops

# Pods de l'observabilité
kubectl get pods -n observability

# Logs du backend
kubectl logs -n tp2devops -l app=backend --tail=50 -f

# Logs du OpenTelemetry Collector
kubectl logs -n observability -l app=otel-collector --tail=50 -f

# Métriques du backend
kubectl exec -n tp2devops deploy/backend -- curl -s localhost:3000/metrics
```

### Nettoyage

```bash
# Script automatique
./scripts/cleanup.sh

# Ou manuellement
kubectl delete namespace tp2devops
kubectl delete namespace observability
kubectl delete -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.70.0/bundle.yaml

# Arrêter Minikube
minikube stop

# Supprimer Minikube
minikube delete
```

---

## 3. Cluster Kubernetes Production

### Prérequis

- Cluster Kubernetes (GKE, EKS, AKS, ou autre)
- `kubectl` configuré
- Helm (optionnel mais recommandé)
- Ingress Controller installé

### Recommandations Production

#### 1. Stockage Persistant

Modifier les manifests pour utiliser des StorageClass appropriées :

```yaml
# Dans prometheus-operator.yaml, loki-stack.yaml, tempo.yaml, grafana.yaml
storage:
  volumeClaimTemplate:
    spec:
      storageClassName: your-storage-class  # ex: gp3, standard-rwo
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 50Gi  # Augmenter pour la prod
```

#### 2. Ressources

Ajuster les ressources dans les manifests :

```yaml
resources:
  requests:
    memory: "2Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

#### 3. Haute Disponibilité

```yaml
spec:
  replicas: 3  # Au lieu de 1
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchLabels:
                app: backend
            topologyKey: kubernetes.io/hostname
```

#### 4. Ingress

Créer un fichier `k8s/ingress.yaml` :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tp2devops-ingress
  namespace: tp2devops
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - app.yourdomain.com
      secretName: tp2devops-tls
  rules:
    - host: app.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 3000

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: observability
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - grafana.yourdomain.com
      secretName: grafana-tls
  rules:
    - host: grafana.yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: grafana
                port:
                  number: 3000
```

#### 5. Secrets

Créer des secrets pour les credentials :

```bash
# Grafana admin password
kubectl create secret generic grafana-admin \\
  --from-literal=admin-user=admin \\
  --from-literal=admin-password=$(openssl rand -base64 32) \\
  -n observability

# Image pull secrets (si registry privé)
kubectl create secret docker-registry regcred \\
  --docker-server=ghcr.io \\
  --docker-username=$GITHUB_USER \\
  --docker-password=$GITHUB_TOKEN \\
  -n tp2devops
```

#### 6. Monitoring des Ressources

Ajouter des `ResourceQuota` et `LimitRange` :

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: tp2devops-quota
  namespace: tp2devops
spec:
  hard:
    requests.cpu: "4"
    requests.memory: "8Gi"
    limits.cpu: "8"
    limits.memory: "16Gi"
    persistentvolumeclaims: "10"
```

---

## 🔍 Validation du Déploiement

### Checklist Complète

```bash
# 1. Tous les namespaces existent
kubectl get namespaces | grep -E "tp2devops|observability"

# 2. Tous les pods sont Running
kubectl get pods -n tp2devops
kubectl get pods -n observability

# 3. Tous les services sont créés
kubectl get svc -n tp2devops
kubectl get svc -n observability

# 4. PVCs sont Bound
kubectl get pvc -n observability

# 5. ServiceMonitors existent
kubectl get servicemonitor -A

# 6. Prometheus scrape les targets
kubectl port-forward -n observability svc/prometheus 9090:9090
# → http://localhost:9090/targets (tous doivent être UP)

# 7. Grafana a les datasources
# → http://localhost:3000/datasources (3 datasources configurées)

# 8. L'application fonctionne
curl http://$(kubectl get svc frontend -n tp2devops -o jsonpath='{.status.loadBalancer.ingress[0].ip}')/health

# 9. Les métriques sont collectées
kubectl exec -n tp2devops deploy/backend -- curl -s localhost:3000/metrics | grep tp2devops

# 10. Les logs sont dans Loki
kubectl port-forward -n observability svc/loki 3100:3100
curl -G -s "http://localhost:3100/loki/api/v1/query" \\
  --data-urlencode 'query={namespace="tp2devops"}' | jq .

# 11. Les traces sont dans Tempo
# Générer du trafic puis vérifier dans Grafana Explore → Tempo
```

---

## 🚨 Troubleshooting

### Pods ne démarrent pas

```bash
# Voir les événements
kubectl get events -n tp2devops --sort-by='.lastTimestamp'

# Décrire le pod
kubectl describe pod <pod-name> -n tp2devops

# Voir les logs
kubectl logs <pod-name> -n tp2devops
```

### Images Docker non trouvées

```bash
# Pour Minikube : utiliser le démon Docker de Minikube
eval $(minikube docker-env)
docker images

# Pour prod : vérifier imagePullSecrets
kubectl get pods -n tp2devops -o yaml | grep imagePullSecrets
```

### Prometheus ne scrape pas

```bash
# Vérifier le ServiceMonitor
kubectl get servicemonitor -n tp2devops -o yaml

# Vérifier les labels
kubectl get svc backend -n tp2devops --show-labels

# Vérifier les targets dans Prometheus
kubectl port-forward -n observability svc/prometheus 9090:9090
# → http://localhost:9090/targets
```

### Logs non visibles dans Loki

```bash
# Vérifier Promtail logs
kubectl logs -n observability daemonset/promtail

# Vérifier Loki logs
kubectl logs -n observability statefulset/loki

# Tester manuellement
kubectl port-forward -n observability svc/loki 3100:3100
curl http://localhost:3100/ready
```

---

## 📊 Monitoring Post-Déploiement

### Dashboards Recommandés

1. **Kubernetes Cluster Monitoring**
   - ID Grafana : 315
   - Import : Grafana → Dashboards → Import → 315

2. **Node Exporter Full**
   - ID Grafana : 1860

3. **Loki Dashboard**
   - ID Grafana : 13639

### Alertes Importantes

Créer des `PrometheusRule` pour :

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: tp2devops-alerts
  namespace: tp2devops
spec:
  groups:
    - name: application
      interval: 30s
      rules:
        - alert: HighErrorRate
          expr: rate(tp2devops_http_requests_total{status_code=~"5.."}[5m]) > 0.05
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "High error rate detected"
            
        - alert: HighLatency
          expr: histogram_quantile(0.95, rate(tp2devops_http_request_duration_seconds_bucket[5m])) > 1
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "High latency detected (p95 > 1s)"
```

---

**Déploiement complet avec observabilité production-ready ! 🚀**

