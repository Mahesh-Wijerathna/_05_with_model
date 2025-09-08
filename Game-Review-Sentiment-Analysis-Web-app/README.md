"# Game Review Sentiment Analysis

A full-stack application for analyzing game review sentiments using React frontend and Flask backend with BERT model.

## 🚀 Deployment Overview

This project uses GitHub Actions for CI/CD with local Minikube deployment:

1. **Push to GitHub** → Triggers GitHub Actions
2. **Build Docker Images** → Frontend & Backend
3. **Push to GHCR** → GitHub Container Registry
4. **Deploy to Minikube** → Local Kubernetes cluster

## 📋 Prerequisites

- [Docker](https://docker.com) installed
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- GitHub repository with Actions enabled

## 🏗️ Project Structure

```
Game-Review-Sentiment-Analysis-Web-app/
├── game-review-sentiment/          # React frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
├── game-review-sentiment-backend/  # Flask backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app.py
├── k8s/                           # Kubernetes manifests
│   ├── namespace.yml
│   ├── frontend-deployment.yml
│   ├── frontend-service.yml
│   ├── backend-deployment.yml
│   └── backend-service.yml
├── .github/workflows/
│   └── build-and-deploy.yml       # GitHub Actions workflow
├── docker-compose.yml
├── Jenkinsfile                    # Alternative Jenkins pipeline
└── deploy-local.sh               # Local deployment script
```

## 🔄 GitHub Actions Workflow

### Automatic Deployment (on push to main)

The workflow automatically:
1. Builds Docker images for frontend and backend
2. Pushes images to GitHub Container Registry (GHCR)
3. Deploys to Minikube (if running locally)

### Manual Local Deployment

```bash
# Start Minikube
minikube start

# Run deployment script
chmod +x deploy-local.sh
./deploy-local.sh
```

## 🌐 Access Your Application

After deployment, access your application at:

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
 