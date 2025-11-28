import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Eye, Shield, ChevronDown, ChevronUp } from 'lucide-react';

function CardCountingDisplay({ deckManager, betHistory, currentBet, baseBet }) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getBetRecommendationColor = () => {
    if (currentBet < recommendedBet * 0.8) return 'text-yellow-400';
    if (currentBet > recommendedBet * 1.2) return 'text-orange-400';
    return 'text-green-400';
  };

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
      
      {/* Collapsible Header - Main Count Display */}
      <div className="glass-premium rounded-xl overflow-hidden border border-casino-gold/20">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full ${status.bg} bg-opacity-50 p-4 border-l-4 ${status.color.replace('text-', 'border-')} transition-all hover:bg-opacity-70`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon size={28} className={status.color} />
              <div className="text-left">
                <div className="font-heading text-xl font-bold tracking-wider">{status.label}</div>
                <div className={`text-sm font-tech ${status.color}`}>
                  {advantage > 0 ? `+${advantage}%` : `${advantage}%`} Player Edge
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-body">True Count</div>
                <div className={`text-4xl font-tech font-bold ${status.color}`}>
                  {trueCount > 0 ? '+' : ''}{trueCount}
                </div>
              </div>
              
              {isExpanded ? (
                <ChevronUp size={24} className="text-gray-400" />
              ) : (
                <ChevronDown size={24} className="text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="p-4 space-y-4 slide-in-top-premium bg-black/30">
            
            {/* Detailed Count Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-card-premium p-3 rounded-lg">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-body">Running Count</div>
                <div className="text-2xl font-tech font-bold text-gray-300 font-mono">
                  {runningCount > 0 ? '+' : ''}{runningCount}
                </div>
              </div>
              <div className="stat-card-premium p-3 rounded-lg">
                <div className="text-xs text-gray-400 uppercase tracking-wider font-body">Decks Left</div>
                <div className="text-2xl font-tech font-bold text-gray-300 font-mono">
                  {decksRemaining}
                </div>
              </div>
            </div>

            {/* Penetration Meter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-heading font-semibold tracking-wider">SHOE PENETRATION</span>
                <span className="text-sm font-tech text-casino-gold">{penetration}%</span>
              </div>
              <div className="relative h-4 bg-gray-900 rounded-full overflow-hidden border border-casino-gold/20">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                    penetration < 25 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                    penetration < 50 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    penetration < 75 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    'bg-gradient-to-r from-orange-500 to-red-600'
                  }`}
                  style={{ width: `${penetration}%` }}
                >
                  <div className="w-full h-full animate-pulse bg-white/20"></div>
                </div>
                {/* Cut card indicator at 75% */}
                <div 
                  className="absolute top-0 h-full w-1 bg-casino-gold shadow-lg shadow-casino-gold"
                  style={{ left: '75%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1 font-body">
                <span>Fresh</span>
                <span className="text-casino-gold font-semibold">Cut Card (75%)</span>
                <span>Deep</span>
              </div>
            </div>

            {/* Betting Recommendation */}
            <div className="glass-premium rounded-lg p-4 border border-casino-gold/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-heading font-semibold tracking-wider">BETTING RECOMMENDATION</span>
                {penetration < 25 && (
                  <span className="text-xs text-yellow-400 font-body">⚠️ Early shoe</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-body">Optimal Bet</div>
                  <div className="text-3xl font-tech font-bold text-green-400 font-mono">
                    ${recommendedBet}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-body">Current Bet</div>
                  <div className={`text-3xl font-tech font-bold font-mono ${getBetRecommendationColor()}`}>
                    ${currentBet}
                  </div>
                </div>
              </div>

              {currentBet !== recommendedBet && currentBet > 0 && (
                <div className="mt-3 text-sm font-body">
                  {currentBet < recommendedBet ? (
                    <div className="text-yellow-400 flex items-center gap-2">
                      <span>💡</span>
                      <span>Consider increasing bet to ${recommendedBet}</span>
                    </div>
                  ) : (
                    <div className="text-orange-400 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Bet is higher than recommended</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Heat Meter */}
            {betHistory && betHistory.length >= 10 && (
              <div className="glass-premium rounded-lg p-4 border border-casino-gold/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HeatIcon size={18} className={heatWarning.color} />
                    <span className="text-sm font-heading font-semibold tracking-wider">CASINO HEAT</span>
                  </div>
                  <span className={`text-xs font-tech font-bold ${heatWarning.color}`}>
                    {heatLevel}/10
                  </span>
                </div>

                <div className="relative h-3 bg-gray-900 rounded-full overflow-hidden mb-2 border border-casino-gold/20">
                  <div 
                    className={`absolute left-0 top-0 h-full transition-all duration-500 ${
                      heatLevel < 3 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      heatLevel < 6 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      heatLevel < 9 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${heatLevel * 10}%` }}
                  >
                    <div className="w-full h-full animate-pulse bg-white/30"></div>
                  </div>
                </div>

                <div className={`text-xs font-body ${heatWarning.color}`}>
                  {heatWarning.message}
                </div>
              </div>
            )}

            {/* Card Composition (Advanced) */}
            <details className="glass-premium rounded-lg overflow-hidden border border-casino-gold/20">
              <summary className="p-3 cursor-pointer font-heading font-semibold text-sm hover:bg-white/5 transition tracking-wider">
                📊 ADVANCED COUNT ANALYSIS
              </summary>
              <div className="p-4 pt-0 space-y-3 text-sm font-body">
                <div>
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Cards Seen</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-900 p-2 rounded border border-green-500/20">
                      <div className="text-xs text-gray-400">Low (2-6)</div>
                      <div className="font-tech font-bold text-green-400 text-xl">{composition.low}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-gray-500/20">
                      <div className="text-xs text-gray-400">Neutral (7-9)</div>
                      <div className="font-tech font-bold text-gray-300 text-xl">{composition.neutral}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-red-500/20">
                      <div className="text-xs text-gray-400">High (10-A)</div>
                      <div className="font-tech font-bold text-red-400 text-xl">{composition.high}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Cards Remaining</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-900 p-2 rounded border border-casino-gold/20">
                      <div className="text-xs text-gray-400">Low Cards</div>
                      <div className="font-tech font-bold text-xl">{expectedRemaining.low}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-casino-gold/20">
                      <div className="text-xs text-gray-400">High Cards</div>
                      <div className="font-tech font-bold text-xl">{expectedRemaining.high}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded border border-casino-gold/20">
                      <div className="text-xs text-gray-400">Aces Left</div>
                      <div className="font-tech font-bold text-casino-gold text-xl">{expectedRemaining.aces}</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mt-2 italic">
                  💡 High true count + deep penetration = optimal betting opportunity
                </div>
              </div>
            </details>

          </div>
        )}
      </div>
    </div>
  );
}

export default CardCountingDisplay;
