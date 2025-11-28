import React from 'react';
import { TrendingUp, TrendingDown, Shuffle } from 'lucide-react';
import { BaccaratRoadmaps } from '../utils/baccaratRoadmaps';

function BaccaratRoadmapDisplay({ results, pendingCommission }) {
  if (results.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center text-gray-400">
        <Shuffle size={32} className="mx-auto mb-2 opacity-50" />
        <p>Start playing to see roadmap patterns</p>
      </div>
    );
  }

  const beadPlate = BaccaratRoadmaps.generateBeadPlate(results);
  const bigRoad = BaccaratRoadmaps.generateBigRoad(results);
  const bigEyeBoy = BaccaratRoadmaps.generateBigEyeBoy(bigRoad);
  const smallRoad = BaccaratRoadmaps.generateSmallRoad(bigRoad);
  const cockroachRoad = BaccaratRoadmaps.generateCockroachRoad(bigRoad);
  const patterns = BaccaratRoadmaps.analyzePatterns(results);
  const suggestion = BaccaratRoadmaps.suggestBet(results);

  // Calculate statistics
  const bankerWins = results.filter(r => r === 'banker').length;
  const playerWins = results.filter(r => r === 'player').length;
  const ties = results.filter(r => r === 'tie').length;
  const total = results.length;

  return (
    <div className="space-y-4">
      
      {/* Statistics */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
          📊 Shoe Statistics
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-400">Banker</div>
            <div className="text-2xl font-bold text-red-400">{bankerWins}</div>
            <div className="text-xs text-gray-400">
              {total > 0 ? ((bankerWins / total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Player</div>
            <div className="text-2xl font-bold text-blue-400">{playerWins}</div>
            <div className="text-xs text-gray-400">
              {total > 0 ? ((playerWins / total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Tie</div>
            <div className="text-2xl font-bold text-green-400">{ties}</div>
            <div className="text-xs text-gray-400">
              {total > 0 ? ((ties / total) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-2xl font-bold text-gray-300">{total}</div>
            <div className="text-xs text-gray-400">hands</div>
          </div>
        </div>

        {pendingCommission > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Accumulated Commission (5%)</span>
              <span className="text-lg font-bold text-yellow-400">${pendingCommission.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pattern Analysis */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
          🎯 Pattern Analysis
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Current Streak:</span>
            <span className="font-bold">
              {patterns.currentStreak} {patterns.currentStreakType}
              {patterns.currentStreak > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Longest Banker:</span>
            <span className="font-bold text-red-400">{patterns.longestBankerStreak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Longest Player:</span>
            <span className="font-bold text-blue-400">{patterns.longestPlayerStreak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Chops:</span>
            <span className="font-bold">{patterns.chops}</span>
          </div>
        </div>

        {patterns.isDragonTail && (
          <div className="mt-3 bg-purple-900 bg-opacity-30 p-2 rounded border-l-4 border-purple-400">
            <div className="text-sm font-bold text-purple-300">🐉 DRAGON TAIL DETECTED!</div>
            <div className="text-xs text-gray-300">Long streak of {patterns.currentStreak} {patterns.currentStreakType}s</div>
          </div>
        )}

        {patterns.isChopping && (
          <div className="mt-3 bg-orange-900 bg-opacity-30 p-2 rounded border-l-4 border-orange-400">
            <div className="text-sm font-bold text-orange-300">⚡ CHOPPING PATTERN</div>
            <div className="text-xs text-gray-300">Results alternating between Banker and Player</div>
          </div>
        )}
      </div>

      {/* Betting Suggestion */}
      <div className={`rounded-xl p-4 border-l-4 ${
        suggestion.suggestion === 'banker' ? 'bg-red-900 bg-opacity-30 border-red-400' : 'bg-blue-900 bg-opacity-30 border-blue-400'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {suggestion.confidence === 'high' ? <TrendingUp className="text-green-400" size={20} /> :
           suggestion.confidence === 'medium' ? <TrendingUp className="text-yellow-400" size={20} /> :
           <TrendingDown className="text-gray-400" size={20} />}
          <span className="font-bold text-lg">
            Pattern suggests: <span className="text-yellow-300">{suggestion.suggestion.toUpperCase()}</span>
          </span>
        </div>
        <div className="text-sm text-gray-300">{suggestion.reason}</div>
        <div className="text-xs text-gray-400 mt-1">
          Confidence: <span className={`font-bold ${
            suggestion.confidence === 'high' ? 'text-green-400' :
            suggestion.confidence === 'medium' ? 'text-yellow-400' : 'text-gray-400'
          }`}>{suggestion.confidence.toUpperCase()}</span>
        </div>
      </div>

      {/* Big Road */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-yellow-400 mb-3">Big Road (大路)</h3>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-px bg-gray-700 p-1 rounded" style={{ 
            gridTemplateColumns: `repeat(${Math.max(bigRoad.length, 10)}, 32px)`,
            gridTemplateRows: 'repeat(6, 32px)'
          }}>
            {Array.from({ length: 6 }).map((_, row) => (
              Array.from({ length: Math.max(bigRoad.length, 10) }).map((_, col) => {
                const cell = bigRoad[col]?.[row];
                return (
                  <div
                    key={`${col}-${row}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      cell ? 
                        cell.result === 'banker' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                      : 'bg-gray-800'
                    }`}
                  >
                    {cell?.result === 'banker' ? 'B' : cell?.result === 'player' ? 'P' : ''}
                    {cell?.tie > 0 && (
                      <span className="absolute text-green-400 text-xs">T</span>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>

      {/* Derived Roads */}
      <div className="grid md:grid-cols-3 gap-4">
        <DerivedRoadDisplay title="Big Eye Boy" road={bigEyeBoy} />
        <DerivedRoadDisplay title="Small Road" road={smallRoad} />
        <DerivedRoadDisplay title="Cockroach" road={cockroachRoad} />
      </div>

      {/* Bead Plate */}
      <details className="glass rounded-xl overflow-hidden">
        <summary className="p-4 cursor-pointer font-bold text-yellow-400 hover:bg-gray-800 transition">
          📿 Bead Plate (珠盘路) - Full History
        </summary>
        <div className="p-4 pt-0 overflow-x-auto">
          <div className="inline-grid gap-1 bg-gray-700 p-2 rounded" style={{
            gridTemplateColumns: `repeat(${Math.max(beadPlate.length, 10)}, 28px)`,
            gridTemplateRows: 'repeat(6, 28px)'
          }}>
            {Array.from({ length: Math.max(beadPlate.length, 10) }).map((_, col) => (
              Array.from({ length: 6 }).map((_, row) => {
                const cell = beadPlate[col]?.[row];
                return (
                  <div
                    key={`${col}-${row}`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      cell === 'banker' ? 'bg-red-600' :
                      cell === 'player' ? 'bg-blue-600' :
                      cell === 'tie' ? 'bg-green-600' :
                      'bg-gray-800'
                    }`}
                  >
                    {cell === 'banker' ? 'B' : cell === 'player' ? 'P' : cell === 'tie' ? 'T' : ''}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </details>

    </div>
  );
}

// Helper component for derived roads
function DerivedRoadDisplay({ title, road }) {
  return (
    <div className="glass rounded-xl p-3">
      <h4 className="font-bold text-sm text-gray-300 mb-2">{title}</h4>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-px bg-gray-700 p-1 rounded" style={{
          gridTemplateColumns: `repeat(${Math.max(road.length, 8)}, 20px)`,
          gridTemplateRows: 'repeat(6, 20px)'
        }}>
          {Array.from({ length: 6 }).map((_, row) => (
            Array.from({ length: Math.max(road.length, 8) }).map((_, col) => {
              const cell = road[col]?.[row];
              return (
                <div
                  key={`${col}-${row}`}
                  className={`w-5 h-5 rounded-full ${
                    cell === 'red' ? 'bg-red-500' :
                    cell === 'blue' ? 'bg-blue-500' :
                    'bg-gray-800'
                  }`}
                />
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
}

export default BaccaratRoadmapDisplay;
