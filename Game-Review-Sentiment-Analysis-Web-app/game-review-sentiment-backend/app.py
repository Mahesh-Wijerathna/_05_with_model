# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
from datetime import datetime
import sqlite3
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables for model and tokenizer
model = None
tokenizer = None

class BertSentimentAnalyzer:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
    def load_model(self, model_path):
        """Load your trained BERT model"""
        try:
            if os.path.exists(model_path):
                # Load from local directory
                print(f"Loading model from: {model_path}")
                self.tokenizer = AutoTokenizer.from_pretrained(model_path)
                self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
            else:
                # Load pre-trained model if your model doesn't exist yet
                print("Loading pre-trained BERT model...")
                self.tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    'bert-base-uncased',
                    num_labels=2  # positive, negative
                )
            
            self.model.to(self.device)
            self.model.eval()
            print("✅ BERT model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            return False
    
    def predict(self, text):
        """Predict sentiment for given text"""
        if self.model is None or self.tokenizer is None:
            return None, None
        
        try:
            # Tokenize input
            inputs = self.tokenizer(
                text,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt"
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                
            # Get predicted class and confidence
            confidence, predicted_class = torch.max(predictions, dim=1)
            
            # Convert to readable format
            sentiment = "positive" if predicted_class.item() == 1 else "negative"
            confidence_score = confidence.item()
            
            return sentiment, confidence_score
            
        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            return None, None

# Initialize analyzer
analyzer = BertSentimentAnalyzer()

# Database functions
def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect('game_reviews.db')
    cursor = conn.cursor()
    
    # Create reviews table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_name TEXT,
            review_text TEXT,
            sentiment TEXT,
            confidence REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized!")

def store_review(game_name, review_text, sentiment, confidence):
    """Store review in database for analytics"""
    try:
        conn = sqlite3.connect('game_reviews.db')
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO reviews (game_name, review_text, sentiment, confidence) VALUES (?, ?, ?, ?)",
            (game_name, review_text, sentiment, confidence)
        )
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"Error storing review: {e}")

# API Routes

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check API and model health"""
    model_status = "loaded" if analyzer.model is not None else "not loaded"
    return jsonify({
        'status': 'healthy',
        'model_status': model_status,
        'device': str(analyzer.device),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict-sentiment', methods=['POST'])
def predict_sentiment_api():
    """Predict sentiment for given text"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        game_name = data.get('game_name', 'Unknown')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Get prediction from BERT model
        sentiment, confidence = analyzer.predict(text)
        
        if sentiment is None:
            return jsonify({'error': 'Model prediction failed'}), 500
        
        # Store in database for analytics
        store_review(game_name, text, sentiment, confidence)
        
        response = {
            'sentiment': sentiment,
            'confidence': confidence,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in predict_sentiment_api: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/game-analytics/<game_name>', methods=['GET'])
def get_game_analytics(game_name):
    """Get analytics for a specific game"""
    try:
        conn = sqlite3.connect('game_reviews.db')
        cursor = conn.cursor()
        
        # Get total reviews and sentiment counts
        cursor.execute(
            "SELECT sentiment, COUNT(*) FROM reviews WHERE LOWER(game_name) LIKE ? GROUP BY sentiment",
            (f'%{game_name.lower()}%',)
        )
        sentiment_counts = dict(cursor.fetchall())
        
        if not sentiment_counts:
            conn.close()
            return jsonify({'error': 'Game not found in database'}), 404
        
        # Get recent reviews
        cursor.execute(
            "SELECT review_text, sentiment, confidence FROM reviews WHERE LOWER(game_name) LIKE ? ORDER BY timestamp DESC LIMIT 10",
            (f'%{game_name.lower()}%',)
        )
        recent_reviews = [
            {
                'text': row[0][:100] + '...' if len(row[0]) > 100 else row[0],
                'sentiment': row[1],
                'confidence': row[2]
            }
            for row in cursor.fetchall()
        ]
        
        # Get monthly data (last 6 months)
        cursor.execute("""
            SELECT 
                strftime('%m', timestamp) as month,
                sentiment,
                COUNT(*) as count
            FROM reviews 
            WHERE LOWER(game_name) LIKE ? 
                AND timestamp >= date('now', '-6 months')
            GROUP BY month, sentiment
            ORDER BY month
        """, (f'%{game_name.lower()}%',))
        
        monthly_results = cursor.fetchall()
        conn.close()
        
        # Process monthly data
        monthly_data = {}
        for row in monthly_results:
            month = int(row[0])
            sentiment = row[1]
            count = row[2]
            
            if month not in monthly_data:
                monthly_data[month] = {'positive': 0, 'negative': 0}
            monthly_data[month][sentiment] = count
        
        # Format monthly data for charts
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        formatted_monthly = []
        
        current_month = datetime.now().month
        for i in range(6):  # Last 6 months
            month_num = (current_month - i - 1) % 12 + 1
            month_data = monthly_data.get(month_num, {'positive': 0, 'negative': 0})
            formatted_monthly.append({
                'month': month_names[month_num - 1],
                'positive': month_data['positive'],
                'negative': month_data['negative']
            })
        
        # Calculate totals
        total_reviews = sum(sentiment_counts.values())
        positive_count = sentiment_counts.get('positive', 0)
        negative_count = sentiment_counts.get('negative', 0)
        
        response = {
            'totalReviews': total_reviews,
            'sentiment': {
                'positive': positive_count,
                'negative': negative_count
            },
            'monthlyData': list(reversed(formatted_monthly)),
            'recentReviews': recent_reviews
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in get_game_analytics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-prediction', methods=['GET'])
def test_prediction():
    """Test endpoint to verify model is working"""
    test_texts = [
        "This game is absolutely amazing! Great graphics and gameplay.",
        "Terrible game, full of bugs and disappointing gameplay.",
        "It's an okay game, not the best but playable."
    ]
    
    results = []
    for text in test_texts:
        sentiment, confidence = analyzer.predict(text)
        results.append({
            'text': text,
            'sentiment': sentiment,
            'confidence': confidence
        })
    
    return jsonify({
        'test_results': results,
        'model_status': 'working' if analyzer.model else 'not loaded'
    })

if __name__ == '__main__':
    print("🚀 Starting BERT Sentiment Analysis API...")
    
    # Initialize database
    init_db()
    
    # Load BERT model
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "model")
    #MODEL_PATH = "C:\\Users\\rpras\\OneDrive\\Documents\\Rashmitha\\Semester_7\\Advanced AI\\Project\\Sentiment UI\\game-review-sentiment-backend\\model"  # Change this to your model path
    model_loaded = analyzer.load_model(MODEL_PATH)
    
    if not model_loaded:
        print("⚠️  Warning: Using pre-trained model. Replace with your trained model.")
    
    print("🌐 API will be available at: http://localhost:5000")
    print("📊 React app should connect to this API")
    print("🔗 Test the API at: http://localhost:5000/api/health")
    
    # Start Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)