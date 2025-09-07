# config.py
import os

class Config:
    # Model Configuration
    MODEL_PATH = os.environ.get('MODEL_PATH', './bert_sentiment_model')
    MAX_LENGTH = 512
    BATCH_SIZE = 16
    
    # Database Configuration
    DATABASE_PATH = 'game_reviews.db'
    
    # API Configuration
    API_HOST = '0.0.0.0'
    API_PORT = 5000
    DEBUG = True
    
    # CORS Configuration
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']