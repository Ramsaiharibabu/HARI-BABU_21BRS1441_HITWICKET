Chess-Like Game with MERN Stack

This is a turn-based chess-like game developed using the MERN stack (MongoDB, Express.js, React.js, Node.js) with WebSocket communication enabled via Socket.IO. The game is played on a 5x5 grid where two players, A and B, compete against each other by moving their pieces according to predefined rules.

Features : 
--------------
1. Turn-based Gameplay: Two players take turns to move their pieces on a 5x5 board.

Piece Movement:
------------------
1.Pawns (P) move one block in any direction (Left, Right, Forward, Backward).
2.Hero 1 (H1) moves two blocks in a straight line and can capture any opponent in its path.
3.Hero 2 (H2) moves two blocks diagonally and can capture any opponent in its path.
4.WebSocket Communication: Real-time updates of game state for both players.
5.Winner Declaration: Game ends when all of one player's pieces are captured.

Project Structure : 
------------------------
1.Backend: Node.js, Express.js, MongoDB for handling game logic and real-time communication.
2.Frontend: React.js for UI, showing the board state, player actions, and game progress.
3.WebSocket: Socket.IO for bi-directional communication between the client and server.

Getting Started
------------------------
Prerequisites
1.Node.js (v14+ recommended)
2.MongoDB (local or remote)
3.npm (Node Package Manager)
