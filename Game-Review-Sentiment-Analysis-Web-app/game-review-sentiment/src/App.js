import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Search, MessageSquare, TrendingUp, Star, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('predict');
  const [reviewText, setReviewText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [searchGame, setSearchGame] = useState('');
  const [gameAnalytics, setGameAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [gameName, setGameName] = useState('');

  // API Configuration
  const API_BASE_URL = 'http://localhost:5000/api';

  // Check API health on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setApiStatus(data.model_status === 'loaded' ? 'connected' : 'model-not-loaded');
    } catch (error) {
      console.error('API Health Check Failed:', error);
      setApiStatus('disconnected');
    }
  };

  // Real API call to your BERT model
  const predictSentiment = async () => {
    if (!reviewText.trim()) return;
    
    setIsLoading(true);
    setPrediction(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/predict-sentiment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: reviewText,
          game_name: gameName || 'Unknown'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);
      
    } catch (error) {
      console.error('Error predicting sentiment:', error);
      setPrediction({
        error: 'Failed to connect to sentiment analysis API. Please check if the backend is running.',
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Real API call for game analytics
  const searchGameAnalytics = async () => {
    if (!searchGame.trim()) return;
    
    setIsLoading(true);
    setGameAnalytics(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/game-analytics/${encodeURIComponent(searchGame)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setGameAnalytics({
            gameName: searchGame,
            error: 'No reviews found for this game in the database'
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGameAnalytics({
        gameName: searchGame,
        ...data
      });
      
    } catch (error) {
      console.error('Error fetching game analytics:', error);
      setGameAnalytics({
        gameName: searchGame,
        error: 'Failed to fetch analytics. Please check if the backend is running.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#10B981', '#EF4444'];

  // API Status Component
  const ApiStatusBadge = () => {
    const getStatusInfo = () => {
      switch (apiStatus) {
        case 'connected':
          return { icon: CheckCircle, text: 'API Connected', color: 'text-green-400', bgColor: 'bg-green-500 bg-opacity-20' };
        case 'model-not-loaded':
          return { icon: AlertCircle, text: 'Model Not Loaded', color: 'text-yellow-400', bgColor: 'bg-yellow-500 bg-opacity-20' };
        case 'disconnected':
          return { icon: AlertCircle, text: 'API Disconnected', color: 'text-red-400', bgColor: 'bg-red-500 bg-opacity-20' };
        default:
          return { icon: AlertCircle, text: 'Checking...', color: 'text-gray-400', bgColor: 'bg-gray-500 bg-opacity-20' };
      }
    };

    const { icon: Icon, text, color, bgColor } = getStatusInfo();

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${bgColor}`}>
        <Icon className="w-4 h-4 mr-2" />
        {text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game Review Sentiment Analysis</h1>
          <p className="text-gray-300 mb-4">Powered by BERT Deep Learning Model</p>
          <ApiStatusBadge />
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('predict')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'predict'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <MessageSquare className="inline-block w-5 h-5 mr-2" />
              Review Prediction
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="inline-block w-5 h-5 mr-2" />
              Game Analytics
            </button>
          </div>
        </div>

        {/* Review Prediction Tab */}
        {activeTab === 'predict' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Analyze Review Sentiment
              </h2>
              
              <div className="space-y-6">
                {/* Game Name Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Game Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="e.g., Cyberpunk 2077, The Witcher 3..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Review Text Input */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Enter Game Review Text
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Type or paste a game review here..."
                    className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>
                
                <button
                  onClick={predictSentiment}
                  disabled={!reviewText.trim() || isLoading || apiStatus !== 'connected'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing with BERT...
                    </div>
                  ) : (
                    'Analyze Sentiment'
                  )}
                </button>

                {prediction && (
                  <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">Prediction Results</h3>
                    
                    {prediction.error ? (
                      <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                          <p className="text-red-400">{prediction.error}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${
                            prediction.sentiment === 'positive' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {prediction.sentiment === 'positive' ? (
                              <ThumbsUp className="w-8 h-8 text-white" />
                            ) : (
                              <ThumbsDown className="w-8 h-8 text-white" />
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">Sentiment</p>
                          <p className={`text-lg font-bold capitalize ${
                            prediction.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {prediction.sentiment}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2">
                            <Star className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-gray-300 text-sm">Confidence</p>
                          <p className="text-lg font-bold text-blue-400">
                            {(prediction.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-2">
                            <MessageSquare className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-gray-300 text-sm">Analyzed At</p>
                          <p className="text-lg font-bold text-purple-400">
                            {prediction.timestamp}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Game Sentiment Analytics
              </h2>
              
              <div className="mb-8">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={searchGame}
                      onChange={(e) => setSearchGame(e.target.value)}
                      placeholder="Enter game name to view analytics..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && searchGameAnalytics()}
                    />
                  </div>
                  <button
                    onClick={searchGameAnalytics}
                    disabled={!searchGame.trim() || isLoading}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center shadow-lg"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {gameAnalytics && (
                <div className="space-y-8">
                  {gameAnalytics.error ? (
                    <div className="text-center py-12">
                      <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-6">
                        <div className="flex items-center justify-center mb-4">
                          <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 text-lg">{gameAnalytics.error}</p>
                        <p className="text-gray-400 mt-2">
                          Try analyzing some reviews first, then search for analytics.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-700 rounded-lg p-6 text-center">
                          <h3 className="text-lg font-semibold text-white mb-2">Total Reviews</h3>
                          <p className="text-3xl font-bold text-blue-400">{gameAnalytics.totalReviews.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-6 text-center">
                          <h3 className="text-lg font-semibold text-white mb-2">Positive Reviews</h3>
                          <p className="text-3xl font-bold text-green-400">{gameAnalytics.sentiment.positive.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-6 text-center">
                          <h3 className="text-lg font-semibold text-white mb-2">Negative Reviews</h3>
                          <p className="text-3xl font-bold text-red-400">{gameAnalytics.sentiment.negative.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Charts */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pie Chart */}
                        <div className="bg-gray-700 rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-white mb-4 text-center">Sentiment Distribution</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Positive', value: gameAnalytics.sentiment.positive },
                                  { name: 'Negative', value: gameAnalytics.sentiment.negative }
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {[0, 1].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Monthly Trend */}
                        <div className="bg-gray-700 rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-white mb-4 text-center">Monthly Sentiment Trend</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={gameAnalytics.monthlyData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="month" stroke="#9CA3AF" />
                              <YAxis stroke="#9CA3AF" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#374151',
                                  border: '1px solid #4B5563',
                                  borderRadius: '8px'
                                }}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={3} />
                              <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={3} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Recent Reviews */}
                      {gameAnalytics.recentReviews && gameAnalytics.recentReviews.length > 0 && (
                        <div className="bg-gray-700 rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-white mb-4">Recent Reviews Analysis</h3>
                          <div className="space-y-4">
                            {gameAnalytics.recentReviews.map((review, index) => (
                              <div key={index} className="bg-gray-600 rounded-lg p-4 flex justify-between items-center">
                                <div className="flex-1">
                                  <p className="text-white mb-2">"{review.text}"</p>
                                  <div className="flex items-center space-x-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      review.sentiment === 'positive' 
                                        ? 'bg-green-500 bg-opacity-20 text-green-400' 
                                        : 'bg-red-500 bg-opacity-20 text-red-400'
                                    }`}>
                                      {review.sentiment === 'positive' ? (
                                        <ThumbsUp className="w-4 h-4 mr-1" />
                                      ) : (
                                        <ThumbsDown className="w-4 h-4 mr-1" />
                                      )}
                                      {review.sentiment}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                      Confidence: {(review.confidence * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;