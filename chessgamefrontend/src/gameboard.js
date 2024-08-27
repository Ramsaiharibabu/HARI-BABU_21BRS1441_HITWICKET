import React, { useState, useEffect } from 'react';
import './App.css';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const initialBoardSetup = [
  ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
];

function GameBoard() {
  const [gameState, setGameState] = useState(initialBoardSetup);
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [selectedPiece, setSelectedPiece] = useState(null);

  useEffect(() => {
    socket.on('stateofgame', (newGameState) => {
      setGameState(newGameState.board);
      setCurrentPlayer(newGameState.currentPlayer);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCellClick = (rowIndex, cellIndex) => {
    const piece = gameState[rowIndex][cellIndex];
    if (piece && piece.startsWith(currentPlayer)) {
      setSelectedPiece({ rowIndex, cellIndex, piece });
    }
  };

  const handleMove = (moveCommand) => {
    if (selectedPiece) {
      socket.emit('playerMove', { piece: selectedPiece.piece, move: moveCommand });
      setSelectedPiece(null);
    }
  };

  const renderBoard = () => {
    return gameState.map((row, rowIndex) => (
      row.map((cell, cellIndex) => (
        <div
          key={`${rowIndex}-${cellIndex}`}
          className={`board-cell ${selectedPiece && selectedPiece.rowIndex === rowIndex && selectedPiece.cellIndex === cellIndex ? 'selected' : ''}`}
          onClick={() => handleCellClick(rowIndex, cellIndex)}
        >
          {cell}
        </div>
      ))
    ));
  };

  return (
    <div className="game-container">
      <h2>Current Player: {currentPlayer}</h2>
      <div className="game-board">{renderBoard()}</div>
      {selectedPiece && (
        <div className="controls">
          <h3>Selected: {selectedPiece.piece}</h3>
          {['L', 'R', 'F', 'B', 'FL', 'FR', 'BL', 'BR'].map((move) => (
            <button key={move} onClick={() => handleMove(move)}>{move}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default GameBoard;
