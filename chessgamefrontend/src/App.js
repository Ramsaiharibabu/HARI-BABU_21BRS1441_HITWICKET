import React, { useEffect, useState } from 'react'; 
import GameBoard from './gameboard';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    socket.on('gameState', (state) => {
      setGameState(state);
    });

    return () => socket.off('gameState');
  }, []);

  const handleMove = (move) => {
    socket.emit('playerMove', move);
  };

  return (
    <div className="App">
      <GameBoard gameState={gameState} onMove={handleMove} />
    </div>
  );
}

export default App;
