import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Eye, Shield } from 'lucide-react';

function CardCountingDisplay({ deckManager, betHistory, currentBet, baseBet }) {
  const trueCount = deckManager.getTrueCount();
  const runningCount = deckManager.getRunningCount();
  const penetration = parseFloat(deckManager.getPenetration());
  const advantage = deckManager.getPlayerAdvantage();
  const recommendedBet = deckManager.getRecommendedBet(baseBet);
  const decksRemaining = deckManager.getDecksRemaining().toFixed(1);
  const heatLevel = deckManager.getHeatLevel(betHistory);
  const composition = deckManager.getCountComposition();
  const expectedRemaining = deckManager.getExpectedRemaining();

  // Determine count status
  const getCountStatus = () => {
    if (trueCount >= 3) return { color: 'text-green-400', bg: 'bg-green-900', icon: TrendingUp, label: 'FAVORABLE' };
    if (trueCount >= 1) return { color: 'text-blue-400', bg: 'bg-blue-900', icon: TrendingUp, label: 'SLIGHT EDGE' };
    if (trueCount <= -2) return { color: 'text-red-400', bg: 'bg-red-900', icon: TrendingDown, label: 'UNFAVORABLE' };
    return { color: 'text-gray-400', bg: 'bg-gray-800', icon: Minus, label: 'NEUTRAL' };
  };

  const status = getCountStatus();
  const StatusIcon = status.icon;

  // Get betting recommendation color
  const getBetRecommendationColor = () => {
    if (currentBet < recommendedBet * 0.8) return 'text-yellow-400';
    if (currentBet > recommendedBet * 1.2) return 'text-orange-400';
    return 'text-green-400';
  };

  // Heat level warning
  const getHeatWarning = () => {
    if (heatLevel >= 7) return { color: 'text-red-400', icon: AlertTriangle, message: 'HIGH HEAT - Consider leaving' };
    if (heatLevel >= 4) return { color: 'text-orange-400', icon: Eye, message: 'MODERATE HEAT - Vary bets' };
    if (heatLevel >= 2) return { color: 'text-yellow-400', icon: Eye, message: 'LOW HEAT - Being watched' };
    return { color: 'text-green-400', icon: Shield, message: 'NO HEAT - Playing naturally' };
  };

  const heatWarning = getHeatWarning();
  const HeatIcon = heatWarning.icon;

  return (
    <div className="space-y-4">
      
      {/* Main Count Display */}
      <div className={`${status.bg} bg-opacity-50 rounded-xl p-4 border-l-4 ${status.color.replace('text-', 'border-')}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon size={24} className={status.color} />
            <span className="font-bold text-lg">{status.label}</span>
          </div>
          <div className={`text-sm ${status.color}`}>
            {advantage > 0 ? `+${advantage}%` : `${advantage}%`} Edge
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-400 uppercase">True Count</div>
            <div className={`text-3xl font-bold font-mono ${status.color}`}>
              {trueCount > 0 ? '+' : ''}{trueCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Running Count</div>
            <div className="text-2xl font-bold font-mono text-gray-300">
              {runningCount > 0 ? '+' : ''}{runningCount}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase">Decks Left</div>
            <div className="text-2xl font-bold font-mono text-gray-300">
              {decksRemaining}
            </div>
          </div>
        </div>
      </div>

      {/* Penetration Meter */}
      <div className="glass rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Shoe Penetration</span>
          <span className="text-sm font-mono text-yellow-400">{penetration}%</span>
        </div>
        <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${
              penetration < 25 ? 'bg-blue-500' :
              penetration < 50 ? 'bg-green-500' :
              penetration < 75 ? 'bg-yellow-500' :
              'bg-orange-500'
            }`}
            style={{ width: `${penetration}%` }}
          />
          {/* Cut card indicator at 75% */}
          <div 
            className="absolute top-0 h-full w-1 bg-red-500"
            style={{ left: '75%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Fresh</span>
          <span className="text-red-400">Cut Card (75%)</span>
          <span>Deep</span>
        </div>
      </div>

      {/* Betting Recommendation */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Betting Recommendation</span>
          {penetration < 25 && (
            <span className="text-xs text-yellow-400">⚠️ Early shoe</span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">Optimal Bet</div>
            <div className="text-2xl font-bold text-green-400 font-mono">
              ${recommendedBet}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Current Bet</div>
            <div className={`text-2xl font-bold font-mono ${getBetRecommendationColor()}`}>
              ${currentBet}
            </div>
          </div>
        </div>

        {currentBet !== recommendedBet && (
          <div className="mt-3 text-sm">
            {currentBet < recommendedBet ? (
              <div className="text-yellow-400">💡 Consider increasing bet to ${recommendedBet}</div>
            ) : (
              <div className="text-orange-400">⚠️ Bet is higher than recommended</div>
            )}
          </div>
        )}
      </div>

      {/* Heat Meter */}
      {betHistory && betHistory.length >= 10 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HeatIcon size={18} className={heatWarning.color} />
              <span className="text-sm font-semibold">Casino Heat</span>
            </div>
            <span className={`text-xs font-bold ${heatWarning.color}`}>
              {heatLevel}/10
            </span>
          </div>

          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div 
              className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                heatLevel < 3 ? 'bg-green-500' :
                heatLevel < 6 ? 'bg-yellow-500' :
                heatLevel < 9 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${heatLevel * 10}%` }}
            />
          </div>

          <div className={`text-xs ${heatWarning.color}`}>
            {heatWarning.message}
          </div>
        </div>
      )}

      {/* Card Composition (Advanced) */}
      <details className="glass rounded-xl overflow-hidden">
        <summary className="p-4 cursor-pointer font-semibold text-sm hover:bg-gray-800 transition">
          📊 Advanced Count Analysis
        </summary>
        <div className="p-4 pt-0 space-y-3 text-sm">
          <div>
            <div className="text-xs text-gray-400 mb-2">Cards Seen</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-xs text-gray-400">Low (2-6)</div>
                <div className="font-bold text-green-400">{composition.low}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-xs text-gray-400">Neutral (7-9)</div>
                <div className="font-bold text-gray-300">{composition.neutral}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-xs text-gray-400">High (10-A)</div>
                <div className="font-bold text-red-400">{composition.high}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2">Cards Remaining</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-xs text-gray-400">Low Cards</div>
                <div className="font-bold">{expectedRemaining.low}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-xs text-gray-400">High Cards</div>
                <div className="font-bold">{expectedRemaining.high}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <div className="text-xs text-gray-400">Aces Left</div>
                <div className="font-bold text-yellow-400">{expectedRemaining.aces}</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-2">
            💡 High true count + deep penetration = optimal betting opportunity
          </div>
        </div>
      </details>

    </div>
  );
}

export default CardCountingDisplay;
