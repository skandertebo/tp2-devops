#!/bin/bash

echo "🧹 Cleaning up TP2 DevOps deployment..."

# Delete application
echo "Deleting application..."
kubectl delete -f k8s/application.yaml --ignore-not-found=true

# Delete observability stack
echo "Deleting observability stack..."
kubectl delete -f k8s/grafana.yaml --ignore-not-found=true
kubectl delete -f k8s/otel-collector.yaml --ignore-not-found=true
kubectl delete -f k8s/tempo.yaml --ignore-not-found=true
kubectl delete -f k8s/loki-stack.yaml --ignore-not-found=true
kubectl delete -f k8s/prometheus-operator.yaml --ignore-not-found=true

# Delete namespaces
echo "Deleting namespaces..."
kubectl delete namespace tp2devops --ignore-not-found=true
kubectl delete namespace observability --ignore-not-found=true

# Delete Prometheus Operator
echo "Deleting Prometheus Operator..."
kubectl delete -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.70.0/bundle.yaml --ignore-not-found=true

echo "✅ Cleanup complete!"

