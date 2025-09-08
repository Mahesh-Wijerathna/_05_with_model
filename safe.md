name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: mahesh-wijerathna/game-review-sentiment-app

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    outputs:
      frontend-image: ${{ steps.meta.outputs.tags }}-frontend
      backend-image: ${{ steps.meta.outputs.tags }}-backend

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Verify Dockerfiles exist
      run: |
        if [ ! -f "./Game-Review-Sentiment-Analysis-Web-app/game-review-sentiment/Dockerfile" ]; then
          echo "❌ Frontend Dockerfile not found!"
          exit 1
        fi
        if [ ! -f "./Game-Review-Sentiment-Analysis-Web-app/game-review-sentiment-backend/Dockerfile" ]; then
          echo "❌ Backend Dockerfile not found!"
          exit 1 
        fi
        echo "✅ All Dockerfiles found!"

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      with:
        driver: docker-container

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=raw,value=latest
          type=sha,prefix=sha-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Frontend Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./Game-Review-Sentiment-Analysis-Web-app/game-review-sentiment
        push: true
        tags: ${{ steps.meta.outputs.tags }}-frontend
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: ""
        cache-to: ""

    - name: Build and push Backend Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./Game-Review-Sentiment-Analysis-Web-app/game-review-sentiment-backend
        push: true
        tags: ${{ steps.meta.outputs.tags }}-backend
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: ""
        cache-to: ""

    - name: Generate deployment info
      run: |
        echo "✅ Build completed successfully!"
        echo "Frontend image: ${{ steps.meta.outputs.tags }}-frontend"
        echo "Backend image: ${{ steps.meta.outputs.tags }}-backend"
        echo ""
        echo "📋 To deploy locally:"
        echo "1. Start Minikube: minikube start"
        echo "2. Run: kubectl apply -f k8s/"
        echo "3. Check status: kubectl get pods -n game-review-app"
        echo "4. Access app: minikube service frontend -n game-review-app"
