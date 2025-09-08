"# Game Review Sentiment Analysis

A full-stack application for analyzing game review sentiments using React frontend and Flask backend with BERT model.

## 🚀 Quick Start

### **1. Automatic CI/CD (GitHub Actions)**
Push to `main` branch → Images build automatically → Available in GHCR

### **2. Local Deployment**
```bash
# Make scripts executable
chmod +x deploy-local.sh test-images.sh

# Start Minikube
minikube start

# Deploy to Kubernetes
./deploy-local.sh

# Test images locally (optional)
./test-images.sh
```

### **3. Access Your Application**
- **Frontend**: `http://$(minikube ip):30001`
- **Backend**: `http://$(minikube ip):30002`

## 🛠️ Development Commands

### Docker Compose (Development)
```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Kubernetes (Production)
```bash
# Check status
kubectl get pods -n game-review-app
kubectl get services -n game-review-app

# View logs
kubectl logs -n game-review-app deployment/frontend
kubectl logs -n game-review-app deployment/backend

# Scale deployments
kubectl scale deployment frontend --replicas=2 -n game-review-app

# Clean up
kubectl delete namespace game-review-app
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```
NODE_ENV=development
```

**Backend (.env)**
```
FLASK_ENV=development
```

### Docker Images

Images are automatically tagged and pushed to:
- `ghcr.io/mahesh-wijerathna/_05_with_model:latest-frontend`
- `ghcr.io/mahesh-wijerathna/_05_with_model:latest-backend`

## 📊 Monitoring

### Health Checks
- Frontend: `http://localhost:3000` (readiness/liveness probes)
- Backend: `http://localhost:5000/api/health` (readiness/liveness probes)

### Resource Limits
- Frontend: 128Mi-256Mi RAM, 100m-200m CPU
- Backend: 256Mi-512Mi RAM, 200m-500m CPU

## 🐛 Troubleshooting

### Common Issues

1. **Minikube not starting**
   ```bash
   minikube delete
   minikube start --driver=docker
   ```

2. **Images not pulling**
   ```bash
   kubectl describe pod <pod-name> -n game-review-app
   ```

3. **Services not accessible**
   ```bash
   minikube service list -n game-review-app
   ```

4. **Port conflicts**
   ```bash
   kubectl get services -n game-review-app
   ```

### Logs and Debugging

```bash
# View all logs
kubectl logs -n game-review-app --all-containers=true

# Debug specific pod
kubectl exec -it <pod-name> -n game-review-app -- /bin/sh

# Port forward for local access
kubectl port-forward svc/frontend 3000:3000 -n game-review-app
```

## 🔒 Security

- Images are stored in GitHub Container Registry
- Kubernetes namespace isolation
- Resource limits prevent resource exhaustion
- Health checks ensure service reliability

## 📝 API Documentation

### Backend Endpoints

- `GET /api/health` - Health check
- `POST /api/predict-sentiment` - Sentiment analysis
- `GET /api/game-analytics/<game_name>` - Game analytics

### Request/Response Examples

```bash
# Health check
curl http://localhost:5000/api/health

# Sentiment analysis
curl -X POST http://localhost:5000/api/predict-sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "This game is amazing!", "game_name": "Example Game"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to GitHub (triggers CI/CD)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License." 
 