#!/bin/bash
set -e

echo "🚀 Setting up complete observability stack..."

# Colors for output
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install it first."
    exit 1
fi

echo -e "${YELLOW}1. Creating namespaces...${NC}"
kubectl apply -f k8s/namespace.yaml

echo -e "${YELLOW}2. Installing Prometheus Operator...${NC}"
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.70.0/bundle.yaml

echo -e "${YELLOW}3. Waiting for Prometheus Operator to be ready...${NC}"
kubectl wait --for=condition=Ready pods -l app.kubernetes.io/name=prometheus-operator -n default --timeout=300s

echo -e "${YELLOW}4. Deploying Prometheus...${NC}"
kubectl apply -f k8s/prometheus-operator.yaml

echo -e "${YELLOW}5. Deploying Loki stack...${NC}"
kubectl apply -f k8s/loki-stack.yaml

echo -e "${YELLOW}6. Deploying Tempo...${NC}"
kubectl apply -f k8s/tempo.yaml

echo -e "${YELLOW}7. Deploying OpenTelemetry Collector...${NC}"
kubectl apply -f k8s/otel-collector.yaml

echo -e "${YELLOW}8. Deploying Grafana...${NC}"
kubectl apply -f k8s/grafana.yaml

echo -e "${YELLOW}9. Waiting for services to be ready...${NC}"
kubectl wait --for=condition=Ready pods -l app=loki -n observability --timeout=300s
kubectl wait --for=condition=Ready pods -l app=tempo -n observability --timeout=300s
kubectl wait --for=condition=Ready pods -l app=otel-collector -n observability --timeout=300s
kubectl wait --for=condition=Ready pods -l app=grafana -n observability --timeout=300s

echo -e "${GREEN}✅ Observability stack deployed successfully!${NC}"
echo ""
echo "📊 Access points:"
echo "  - Grafana:    http://$(minikube ip):30300 (admin/admin)"
echo "  - Prometheus: kubectl port-forward -n observability svc/prometheus 9090:9090"
echo "  - Loki:       kubectl port-forward -n observability svc/loki 3100:3100"
echo "  - Tempo:      kubectl port-forward -n observability svc/tempo 3200:3200"
echo ""
echo "🔍 View logs:"
echo "  kubectl logs -f -n observability -l app=otel-collector"
echo "  kubectl logs -f -n observability -l app=promtail"
echo ""
echo "📈 View all resources:"
echo "  kubectl get all -n observability"

