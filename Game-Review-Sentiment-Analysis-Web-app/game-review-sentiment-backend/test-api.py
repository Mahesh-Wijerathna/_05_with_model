# test_api.py
import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_prediction():
    """Test sentiment prediction"""
    print("\n🔍 Testing sentiment prediction...")
    
    test_reviews = [
        {
            "text": "This game is absolutely amazing! Great graphics and storyline.",
            "game_name": "Test Game"
        },
        {
            "text": "Terrible game, full of bugs and crashes constantly.",
            "game_name": "Test Game"
        },
        {
            "text": "The game is okay, nothing special but playable.",
            "game_name": "Test Game"
        }
    ]
    
    for i, review in enumerate(test_reviews, 1):
        try:
            response = requests.post(
                f"{BASE_URL}/predict-sentiment",
                headers={'Content-Type': 'application/json'},
                json=review
            )
            
            print(f"\nTest {i}:")
            print(f"Review: {review['text']}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Sentiment: {result['sentiment']}")
                print(f"Confidence: {result['confidence']:.2f}")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Prediction test {i} failed: {e}")

def test_analytics():
    """Test game analytics"""
    print("\n🔍 Testing game analytics...")
    
    try:
        response = requests.get(f"{BASE_URL}/game-analytics/Test Game")
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Total Reviews: {result['totalReviews']}")
            print(f"Positive: {result['sentiment']['positive']}")
            print(f"Negative: {result['sentiment']['negative']}")
        else:
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Analytics test failed: {e}")

if __name__ == "__main__":
    print("🚀 Testing BERT Sentiment API...")
    
    # Run tests
    if test_health():
        test_prediction()
        test_analytics()
    else:
        print("❌ API is not running. Start the server first with: python app.py")