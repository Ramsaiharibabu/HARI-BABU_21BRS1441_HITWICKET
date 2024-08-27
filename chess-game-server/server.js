const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

mongoose.connect('mongodb://localhost:27017/chessgame', { useNewUrlParser: true, useUnifiedTopology: true });

// Initial game state
let gameState = {
  board: [
    ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
  ],
  currentPlayer: 'A',
  players: {
    A: { /* Player A data */ },
    B: { /* Player B data */ },
  },
  winner: null,
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Initialize the game for new connections
  socket.emit('stateofgame', gameState);

  socket.on('initGame', (playerId) => {
    gameState.players[playerId] = { /* initial player data */ };
    io.emit('stateofgame', gameState);
  });

  // Handle player moves
  socket.on('playerMove', (move) => {
    if (!gameState.winner) { // Only process moves if no winner
      gameState = updateGameState(gameState, move.piece, move.move);
      io.emit('stateofgame', gameState);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server listening on *:3001');
});

function updateGameState(state, piece, move) {
  const { board, currentPlayer } = state;
  const [pieceType, pieceId] = piece.split('-');

  // Find current position of the piece
  let currentPos;
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === piece) {
        currentPos = [row, col];
        break;
      }
    }
  }

  if (!currentPos) return state; // If piece not found, return state unmodified

  let newPos;
  switch (pieceType) {
    case 'P': // Pawn moves one step in any direction
      newPos = getNewPosition(currentPos, move, 1);
      break;
    case 'H1': // Hero 1 moves two steps in a straight line
      newPos = getNewPosition(currentPos, move, 2);
      break;
    case 'H2': // Hero 2 moves two steps diagonally
      newPos = getNewPosition(currentPos, move, 2, true);
      break;
    default:
      return state;
  }

  if (newPos && isValidMove(newPos, board, currentPlayer)) {
    // Make the move
    const [newRow, newCol] = newPos;
    board[currentPos[0]][currentPos[1]] = null; // Remove from old position
    board[newRow][newCol] = piece; // Place in new position

    // Check if any opponent piece is captured
    if (board[newRow][newCol] && board[newRow][newCol][0] !== currentPlayer) {
      board[newRow][newCol] = piece; // Capture opponent piece
    }

    // Check for win condition
    if (checkWinCondition(board, currentPlayer)) {
      state.winner = currentPlayer;
    } else {
      // Change player turn
      state.currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
    }
  }

  return state;
}

function getNewPosition([row, col], move, steps, diagonal = false) {
  switch (move) {
    case 'L':
      return [row, col - steps];
    case 'R':
      return [row, col + steps];
    case 'F':
      return [row - steps, col];
    case 'B':
      return [row + steps, col];
    case 'FL': // Forward-Left (for H2)
      return diagonal ? [row - steps, col - steps] : null;
    case 'FR': // Forward-Right (for H2)
      return diagonal ? [row - steps, col + steps] : null;
    case 'BL': // Backward-Left (for H2)
      return diagonal ? [row + steps, col - steps] : null;
    case 'BR': // Backward-Right (for H2)
      return diagonal ? [row + steps, col + steps] : null;
    default:
      return null;
  }
}

function isValidMove([row, col], board, currentPlayer) {
  // Check board boundaries
  if (row < 0 || col < 0 || row >= board.length || col >= board[0].length) return false;

  // Check if the target cell is empty or contains an opponent's piece
  const targetCell = board[row][col];
  if (!targetCell) return true; // Empty cell

  // Check if the cell contains an opponent's piece
  return targetCell[0] !== currentPlayer;
}

function checkWinCondition(board, currentPlayer) {
  // Check if all opponent pieces are captured
  const opponent = currentPlayer === 'A' ? 'B' : 'A';
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] && board[row][col][0] === opponent) {
        return false; // Opponent piece still exists
      }
    }
  }
  return true; // All opponent pieces captured
}
