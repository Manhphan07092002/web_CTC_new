import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, TrendingUp, AlertTriangle, Lightbulb, 
  Target, Star, RefreshCw, Brain 
} from 'lucide-react';

interface AIInsightsProps {
  aiData: any;
}

const AIInsights: React.FC<AIInsightsProps> = ({ aiData }) => {
  if (!aiData) return null;

  const { recommendations, insights, prediction } = aiData;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-300 text-red-700';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'orange': return 'text-orange-500';
      case 'blue': return 'text-blue-500';
      case 'green': return 'text-green-500';
      case 'red': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😟';
      case 'neutral': return '😐';
      default: return '💡';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Brain size={24} />
          </div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
        </div>
        <p className="text-white/90 text-sm">
          Phân tích thông minh và gợi ý dựa trên dữ liệu của bạn
        </p>
      </div>

      {/* Predictive Analytics */}
      {prediction && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-indigo-600" />
            <h3 className="font-bold text-lg text-gray-800">Dự đoán tháng tới</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Dự kiến</p>
              <p className="text-2xl font-bold text-indigo-600">{prediction.nextMonth}</p>
              <p className="text-xs text-gray-500 mt-1">hoạt động</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Tăng trưởng</p>
              <p className={`text-2xl font-bold ${prediction.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {prediction.growthRate > 0 ? '+' : ''}{prediction.growthRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">so với TB</p>
            </div>
            
            <div className="bg-white p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Xu hướng</p>
              <p className="text-lg font-bold text-gray-800 capitalize">
                {prediction.trend === 'increasing' ? '📈 Tăng' : 
                 prediction.trend === 'decreasing' ? '📉 Giảm' : '➡️ Ổn định'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Độ tin cậy: {prediction.confidence === 'high' ? 'Cao' : 'Trung bình'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Smart Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-yellow-500" />
            <h3 className="font-bold text-lg text-gray-800">Nhận xét thông minh</h3>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border-l-4 ${
                  insight.sentiment === 'positive' ? 'bg-green-50 border-green-500' :
                  insight.sentiment === 'negative' ? 'bg-red-50 border-red-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getSentimentEmoji(insight.sentiment)}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-purple-500" />
            <h3 className="font-bold text-lg text-gray-800">Gợi ý hành động</h3>
          </div>
          
          <div className="space-y-3">
            {recommendations.map((rec: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-white/50 ${getIconColor(rec.color)}`}>
                      {rec.icon === 'alert' && <AlertTriangle size={20} />}
                      {rec.icon === 'star' && <Star size={20} />}
                      {rec.icon === 'refresh' && <RefreshCw size={20} />}
                      {rec.icon === 'sparkles' && <Sparkles size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800">{rec.title}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 font-medium">
                          {rec.priority === 'high' ? 'Ưu tiên cao' : 
                           rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{rec.description}</p>
                    </div>
                  </div>
                  <Link 
                    to="/admin/content?tab=products"
                    className="px-4 py-2 bg-white rounded-lg text-sm font-medium hover:shadow-md transition-shadow whitespace-nowrap"
                  >
                    {rec.action}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Tips */}
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-cyan-600 mt-1" />
          <div>
            <h4 className="font-bold text-gray-800 mb-2">💡 Mẹo từ AI</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              Dashboard này sử dụng AI để phân tích dữ liệu và đưa ra gợi ý thông minh. 
              Các khuyến nghị được cập nhật tự động dựa trên xu hướng và patterns trong dữ liệu của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
