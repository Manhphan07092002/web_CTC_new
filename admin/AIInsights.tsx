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
      case 'high': return 'bg-red-100 dark:bg-rose-950/40 border-red-300 dark:border-rose-900/50 text-red-700 dark:text-rose-300';
      case 'medium': return 'bg-yellow-100 dark:bg-amber-950/40 border-yellow-300 dark:border-amber-900/50 text-yellow-700 dark:text-amber-300';
      case 'low': return 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-900/50 text-blue-700 dark:text-blue-300';
      default: return 'bg-gray-100 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'orange': return 'text-orange-500 dark:text-orange-400';
      case 'blue': return 'text-blue-500 dark:text-blue-400';
      case 'green': return 'text-green-500 dark:text-emerald-400';
      case 'red': return 'text-red-500 dark:text-rose-400';
      default: return 'text-gray-500 dark:text-slate-400';
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 p-6 rounded-2xl shadow-lg text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 dark:bg-black/20 rounded-lg">
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
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-indigo-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Dự đoán tháng tới</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">Dự kiến</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{prediction.nextMonth}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">hoạt động</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">Tăng trưởng</p>
              <p className={`text-2xl font-bold ${prediction.growthRate >= 0 ? 'text-green-600 dark:text-emerald-400' : 'text-red-600 dark:text-rose-400'}`}>
                {prediction.growthRate > 0 ? '+' : ''}{prediction.growthRate}%
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">so với TB</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">Xu hướng</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                {prediction.trend === 'increasing' ? '📈 Tăng' : 
                 prediction.trend === 'decreasing' ? '📉 Giảm' : '➡️ Ổn định'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Độ tin cậy: {prediction.confidence === 'high' ? 'Cao' : 'Trung bình'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Smart Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={20} className="text-yellow-500" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Nhận xét thông minh</h3>
          </div>
          
          <div className="space-y-3">
            {insights.map((insight: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border-l-4 ${
                  insight.sentiment === 'positive' ? 'bg-green-50 dark:bg-emerald-950/40 border-green-500' :
                  insight.sentiment === 'negative' ? 'bg-red-50 dark:bg-rose-950/40 border-red-500' :
                  'bg-blue-50 dark:bg-sky-950/40 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getSentimentEmoji(insight.sentiment)}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-purple-500" />
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Gợi ý hành động</h3>
          </div>
          
          <div className="space-y-3">
            {recommendations.map((rec: any, idx: number) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-white/50 dark:bg-slate-800/80 ${getIconColor(rec.color)}`}>
                      {rec.icon === 'alert' && <AlertTriangle size={20} />}
                      {rec.icon === 'star' && <Star size={20} />}
                      {rec.icon === 'refresh' && <RefreshCw size={20} />}
                      {rec.icon === 'sparkles' && <Sparkles size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800 dark:text-white">{rec.title}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800 font-medium dark:text-slate-200">
                          {rec.priority === 'high' ? 'Ưu tiên cao' : 
                           rec.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-300">{rec.description}</p>
                    </div>
                  </div>
                  <Link 
                    to="/admin/content?tab=products"
                    className="px-4 py-2 bg-white dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 rounded-lg text-sm font-medium hover:shadow-md transition-shadow whitespace-nowrap"
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
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-cyan-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-cyan-600 dark:text-cyan-400 mt-1" />
          <div>
            <h4 className="font-bold text-gray-800 dark:text-white mb-2">💡 Mẹo từ AI</h4>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
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
