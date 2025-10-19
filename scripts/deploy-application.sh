#!/bin/bash
set -e

echo "🚀 Deploying TP2 DevOps application..."

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Build Docker images
echo -e "${YELLOW}1. Building Docker images...${NC}"

# Set Docker environment to use Minikube's Docker daemon
eval $(minikube docker-env)

echo "  Building backend..."
docker build -t tp2devops-backend:latest -f backend/Dockerfile backend/

echo "  Building frontend..."
docker build -t tp2devops-frontend:latest -f Dockerfile .

# Deploy application
echo -e "${YELLOW}2. Deploying application to Kubernetes...${NC}"
kubectl apply -f k8s/application.yaml

# Wait for deployments
echo -e "${YELLOW}3. Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=Ready pods -l app=backend -n tp2devops --timeout=300s
kubectl wait --for=condition=Ready pods -l app=frontend -n tp2devops --timeout=300s

echo -e "${GREEN}✅ Application deployed successfully!${NC}"
echo ""
echo "🌐 Access points:"
echo "  - Frontend:   http://$(minikube ip):30080"
echo "  - Backend API: kubectl port-forward -n tp2devops svc/backend 3000:3000"
echo ""
echo "📊 View application:"
echo "  kubectl get all -n tp2devops"
echo ""
echo "🔍 View logs:"
echo "  kubectl logs -f -n tp2devops -l app=backend"
echo "  kubectl logs -f -n tp2devops -l app=frontend"

