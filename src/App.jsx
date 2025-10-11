import React, { useState } from 'react';
import GameSelector from './components/GameSelector';
import BlackjackGame from './components/BlackjackGame';
import BaccaratGame from './components/BaccaratGame';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame === 'blackjack') {
    return <BlackjackGame onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'baccarat') {
    return <BaccaratGame onBack={() => setSelectedGame(null)} />;
  }

  return <GameSelector onSelectGame={setSelectedGame} />;
}

export default App;
