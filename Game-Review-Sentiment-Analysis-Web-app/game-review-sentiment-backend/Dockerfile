# Use Python official image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PyTorch and transformers
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port 5000
EXPOSE 5000

# Start the Flask application
CMD ["python", "app.py"]
