#!/bin/bash

# Game Review Sentiment Analysis - Local Minikube Deployment Script

echo "🚀 Starting local Minikube deployment..."

# Check if Minikube is running
if ! minikube status | grep -q "Running"; then
    echo "❌ Minikube is not running. Please start it first:"
    echo "   minikube start"
    exit 1
fi

# Create namespace
echo "📦 Creating namespace..."
kubectl create namespace game-review-app --dry-run=client -o yaml | kubectl apply -f -

# Apply Kubernetes manifests
echo "🔧 Applying Kubernetes manifests..."
kubectl apply -f k8s/

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n game-review-app || echo "Frontend deployment timeout"
kubectl wait --for=condition=available --timeout=300s deployment/backend -n game-review-app || echo "Backend deployment timeout"

# Get service URLs
MINIKUBE_IP=$(minikube ip)
FRONTEND_PORT=$(kubectl get svc frontend -n game-review-app -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30001")
BACKEND_PORT=$(kubectl get svc backend -n game-review-app -o jsonpath='{.spec.ports[0].nodePort}' 2>/dev/null || echo "30002")

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://$MINIKUBE_IP:$FRONTEND_PORT"
echo "   Backend:  http://$MINIKUBE_IP:$BACKEND_PORT"
echo ""
echo "📊 Check status:"
echo "   kubectl get pods -n game-review-app"
echo "   kubectl get services -n game-review-app"
echo ""
echo "🛑 To stop:"
echo "   kubectl delete namespace game-review-app"
