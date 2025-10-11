import React from 'react';

function BaccaratRoadmaps({ analytics }) {
  const beadRoad = analytics.getBeadRoad();
  const bigRoad = analytics.getBigRoad();
  const bigEye = analytics.getBigEyeRoad();
  const small = analytics.getSmallRoad();
  const cockroach = analytics.getCockroachRoad();

  return (
    <div className="space-y-4">
      
      {/* Big Road (Most Important) */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
          🎯 Big Road
          <span className="text-xs text-gray-400 font-normal">(Main Pattern Tracker)</span>
        </h3>
        <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {bigRoad.length === 0 ? (
              <div className="text-gray-500 text-sm">No hands played yet</div>
            ) : (
              bigRoad.map((column, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1">
                  {column.map((cell, rowIndex) => (
                    <div
                      key={rowIndex}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold relative ${
                        cell.result === 'player'
                          ? 'border-blue-500 text-blue-400'
                          : 'border-red-500 text-red-400'
                      }`}
                    >
                      {cell.result === 'player' ? 'P' : 'B'}
                      {cell.natural && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-black" />
                      )}
                      {cell.ties > 0 && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-green-400 text-xs">
                          {cell.ties}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500" />
            <span>Player</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full border-2 border-red-500" />
            <span>Banker</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            <span>Natural</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-400">1</span>
            <span>Ties</span>
          </div>
        </div>
      </div>

      {/* Bead Road (Simple History) */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
          📿 Bead Road
          <span className="text-xs text-gray-400 font-normal">(Simple History)</span>
        </h3>
        <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
          <div className="flex flex-wrap gap-1 max-w-full">
            {beadRoad.length === 0 ? (
              <div className="text-gray-500 text-sm">No hands played yet</div>
            ) : (
              beadRoad.slice(-42).map((result, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    result === 'player'
                      ? 'bg-blue-600 text-white'
                      : result === 'banker'
                      ? 'bg-red-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {result === 'player' ? 'P' : result === 'banker' ? 'B' : 'T'}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Derived Roads (Advanced) */}
      <details className="glass rounded-xl overflow-hidden">
        <summary className="p-4 cursor-pointer font-bold text-yellow-400 hover:bg-gray-800 transition flex items-center gap-2">
          🔬 Derived Roads (Advanced)
          <span className="text-xs text-gray-400 font-normal ml-auto">Big Eye • Small • Cockroach</span>
        </summary>
        <div className="p-4 pt-0 space-y-4">
          
          {/* Big Eye Road */}
          <div>
            <h4 className="font-semibold text-sm mb-2 text-blue-400">Big Eye Road</h4>
            <div className="bg-gray-900 rounded-lg p-2 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {bigEye.length === 0 ? (
                  <div className="text-gray-500 text-xs">Need more hands</div>
                ) : (
                  bigEye.map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-1">
                      {column.map((color, rowIndex) => (
                        <div
                          key={rowIndex}
                          className={`w-5 h-5 rounded-full ${
                            color === 'red' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Small Road */}
          <div>
            <h4 className="font-semibold text-sm mb-2 text-purple-400">Small Road</h4>
            <div className="bg-gray-900 rounded-lg p-2 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {small.length === 0 ? (
                  <div className="text-gray-500 text-xs">Need more hands</div>
                ) : (
                  small.map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-1">
                      {column.map((color, rowIndex) => (
                        <div
                          key={rowIndex}
                          className={`w-4 h-4 rounded-full ${
                            color === 'red' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Cockroach Road */}
          <div>
            <h4 className="font-semibold text-sm mb-2 text-orange-400">Cockroach Road</h4>
            <div className="bg-gray-900 rounded-lg p-2 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {cockroach.length === 0 ? (
                  <div className="text-gray-500 text-xs">Need more hands</div>
                ) : (
                  cockroach.map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-1">
                      {column.map((color, rowIndex) => (
                        <div
                          key={rowIndex}
                          className={`w-3 h-3 rounded-full ${
                            color === 'red' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                        />
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mt-3">
            💡 Derived roads show pattern consistency: Red = pattern continues, Blue = pattern breaks
          </div>
        </div>
      </details>

    </div>
  );
}

export default BaccaratRoadmaps;
