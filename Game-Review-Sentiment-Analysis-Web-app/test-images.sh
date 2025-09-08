#!/bin/bash

# Test script to verify Docker images work correctly

echo "🧪 Testing Docker Images..."

# Test Frontend Image
echo "Testing Frontend Image..."
docker run --rm -d --name test-frontend -p 3000:3000 ghcr.io/mahesh-wijerathna/_05_with_model:main-frontend
sleep 10

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend image is working!"
else
    echo "❌ Frontend image failed to start"
fi

docker stop test-frontend
docker rm test-frontend

# Test Backend Image
echo "Testing Backend Image..."
docker run --rm -d --name test-backend -p 5000:5000 ghcr.io/mahesh-wijerathna/_05_with_model:main-backend
sleep 10

if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend image is working!"
else
    echo "❌ Backend image failed to start"
fi

docker stop test-backend
docker rm test-backend

echo "🎉 Image testing completed!"
