import React from 'react';
import { TrendingUp, Target, Zap, AlertCircle } from 'lucide-react';

function BaccaratStats({ analytics }) {
  const stats = analytics.getShoeStats();
  const pattern = analytics.getPatternAnalysis();
  const prediction = analytics.getPrediction();

  const getPatternColor = () => {
    if (pattern.pattern === 'dragon') return 'text-red-400';
    if (pattern.pattern === 'chop') return 'text-blue-400';
    if (pattern.pattern === 'zigzag') return 'text-purple-400';
    return 'text-gray-400';
  };

  const getPatternIcon = () => {
    if (pattern.pattern === 'dragon') return '🐉';
    if (pattern.pattern === 'chop') return '⚡';
    if (pattern.pattern === 'zigzag') return '〰️';
    return '🎲';
  };

  return (
    <div className="space-y-4">
      
      {/* Shoe Statistics */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
          📊 Shoe Statistics
        </h3>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Player</div>
            <div className="text-2xl font-bold text-blue-400">{stats.playerWins}</div>
            <div className="text-xs text-gray-400">{stats.playerPercent}%</div>
          </div>
          <div className="bg-red-900 bg-opacity-30 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Banker</div>
            <div className="text-2xl font-bold text-red-400">{stats.bankerWins}</div>
            <div className="text-xs text-gray-400">{stats.bankerPercent}%</div>
          </div>
          <div className="bg-green-900 bg-opacity-30 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Ties</div>
            <div className="text-2xl font-bold text-green-400">{stats.ties}</div>
            <div className="text-xs text-gray-400">{stats.tiePercent}%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-xs text-gray-400">Total Hands</div>
            <div className="font-bold">{stats.totalHands}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-xs text-gray-400">Naturals (8/9)</div>
            <div className="font-bold text-yellow-400">{stats.naturals}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-xs text-gray-400">Current Streak</div>
            <div className="font-bold">
              {stats.currentStreak.type ? (
                <span className={stats.currentStreak.type === 'player' ? 'text-blue-400' : 'text-red-400'}>
                  {stats.currentStreak.type.toUpperCase()} x{stats.currentStreak.length}
                </span>
              ) : (
                'None'
              )}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-2">
            <div className="text-xs text-gray-400">Longest Streak</div>
            <div className="font-bold">
              {stats.longestStreak.type ? (
                <span className={stats.longestStreak.type === 'player' ? 'text-blue-400' : 'text-red-400'}>
                  {stats.longestStreak.type.toUpperCase()} x{stats.longestStreak.length}
                </span>
              ) : (
                'None'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Analysis */}
      {stats.totalHands >= 5 && (
        <div className={`glass rounded-xl p-4 border-l-4 ${
          pattern.confidence >= 70 ? 'border-green-400' :
          pattern.confidence >= 50 ? 'border-yellow-400' :
          'border-gray-400'
        }`}>
          <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <Target size={20} />
            Pattern Analysis
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getPatternIcon()}</span>
                <div>
                  <div className={`font-bold ${getPatternColor()}`}>
                    {pattern.pattern.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400">{pattern.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Confidence</div>
                <div className="text-lg font-bold text-green-400">{pattern.confidence}%</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Recommendation</div>
              <div className="text-sm font-semibold">{pattern.recommendation}</div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction (Entertainment) */}
      {stats.totalHands >= 3 && (
        <div className="glass rounded-xl p-4 border border-purple-500 border-opacity-30">
          <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
            <Zap size={20} />
            Next Hand Prediction
            <span className="text-xs text-gray-400 font-normal ml-auto">For Entertainment Only</span>
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">Predicted Winner</div>
              <div className={`text-2xl font-bold ${
                prediction.prediction === 'player' ? 'text-blue-400' : 'text-red-400'
              }`}>
                {prediction.prediction.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400 mt-1">{prediction.reason}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Confidence</div>
              <div className="text-3xl font-bold text-purple-400">{prediction.confidence}%</div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-yellow-400 bg-yellow-900 bg-opacity-20 p-2 rounded">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <div>Baccarat is a game of chance. Patterns are for entertainment and don't guarantee future results.</div>
          </div>
        </div>
      )}

      {/* House Edge Reference */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-yellow-400 mb-3">📈 House Edge Reference</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center bg-gray-800 rounded p-2">
            <span>Banker Bet</span>
            <span className="font-bold text-green-400">1.06% (Best Odds)</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 rounded p-2">
            <span>Player Bet</span>
            <span className="font-bold text-blue-400">1.24%</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800 rounded p-2">
            <span>Tie Bet</span>
            <span className="font-bold text-red-400">14.36% (Avoid)</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          💡 Statistically, Banker bet offers the best odds despite 5% commission
        </div>
      </div>

    </div>
  );
}

export default BaccaratStats;
