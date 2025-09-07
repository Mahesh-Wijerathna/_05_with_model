# run.py
from app import app, analyzer, init_db
from config import Config
import os

def setup_environment():
    """Setup the environment and load model"""
    print("🚀 Setting up BERT Sentiment Analysis Environment...")
    
    # Initialize database
    init_db()
    
    # Check if model exists
    if os.path.exists(Config.MODEL_PATH):
        print(f"📁 Found model at: {Config.MODEL_PATH}")
    else:
        print(f"⚠️  Model not found at: {Config.MODEL_PATH}")
        print("📦 Will use pre-trained BERT model instead")
        
    # Load model
    model_loaded = analyzer.load_model(Config.MODEL_PATH)
    
    if model_loaded:
        print("✅ Model loaded successfully!")
    else:
        print("❌ Failed to load model")
        return False
        
    return True

if __name__ == '__main__':
    if setup_environment():
        print(f"🌐 Starting API server at http://{Config.API_HOST}:{Config.API_PORT}")
        print("🔗 API Endpoints:")
        print("  - GET  /api/health")
        print("  - POST /api/predict-sentiment")
        print("  - GET  /api/game-analytics/<game_name>")
        print("  - GET  /api/test-prediction")
        print("\n💡 Test the API with: python test_api.py")
        print("🛑 Stop server with: Ctrl+C")
        
        app.run(
            debug=Config.DEBUG,
            host=Config.API_HOST,
            port=Config.API_PORT
        )
    else:
        print("❌ Failed to start server. Check model configuration.")