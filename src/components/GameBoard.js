import React, { useState } from "react";
import "../styles/GameBoard.css";
import NavBar from "./NavBar";
import blackPiece from "../assets/images/black-piece.png";
import whitePiece from "../assets/images/white-piece.png";

function GameBoard() {
  const size = 8;

  const createBoard = () => {
    const board = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const piece = (i + j) % 2 === 0 ? "B" : "W";
        row.push({ row: i, col: j, piece });
      }
      board.push(row);
    }
    return board;
  };

  const [board, setBoard] = useState(createBoard());
  const [turn, setTurn] = useState("B");
  const [selectedTile, setSelectedTile] = useState(null);
  const [removalPhase, setRemovalPhase] = useState({ B: false, W: false });
  const [winner, setWinner] = useState(null);
  const [turnMessage, setTurnMessage] = useState("Black: Remove one of your stones");
  const [possibleMoves, setPossibleMoves] = useState([]);
  

  const isValidMove = (from, to, currentTurn = turn) => {
    const dx = to.row - from.row;
    const dy = to.col - from.col;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx === 2 && dy === 0) {
      const middle = board[from.row + dx / 2][from.col];
      return middle.piece && middle.piece !== currentTurn && !to.piece;
    }

    if (absDy === 2 && dx === 0) {
      const middle = board[from.row][from.col + dy / 2];
      return middle.piece && middle.piece !== currentTurn && !to.piece;
    }

    return false;
  };

  const getValidMovesForTile = (tile) => {
    const directions = [
      {dx:2, dy:0},
      {dx: -2, dy:0},
      {dx: 0, dy:2},
      {dx: 0, dy: -2},
    ];

    const moves = [];

    for (const {dx, dy} of directions) {
      const newRow = tile.row + dx;
      const newCol = tile.col + dy;

      if (
        newRow >= 0 &&
        newRow < size &&
        newCol >= 0 &&
        newCol < size &&
        isValidMove(tile, board[newRow][newCol])
      ) {
        moves.push({ row: newRow, col: newCol});
      }
    }
    return moves;
  }

  const hasAnyValidMoves = (currentTurn) => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const tile = board[row][col];
        if (tile.piece === currentTurn) {
          const directions = [
            { dx: 2, dy: 0 },
            { dx: -2, dy: 0 },
            { dx: 0, dy: 2 },
            { dx: 0, dy: -2 },
          ];
          for (const { dx, dy } of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            if (
              newRow >= 0 &&
              newRow < size &&
              newCol >= 0 &&
              newCol < size &&
              isValidMove(tile, board[newRow][newCol], currentTurn)
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const handleTileClick = (row, col) => {
    if (winner) return;

    const clickedTile = board[row][col];

    if (!removalPhase[turn]) {
      if (clickedTile.piece === turn) {
        const newBoard = [...board];
        newBoard[row][col] = { ...clickedTile, piece: null };
        setBoard(newBoard);
        const updatedRemoval = { ...removalPhase, [turn]: true };
        setRemovalPhase(updatedRemoval);
        const nextTurn = turn === "B" ? "W" : "B";
        setTurn(nextTurn);
        if (!updatedRemoval["W"] && turn === "B") {
          setTurnMessage("White: Remove one of your stones");
        } else {
          setTurnMessage("Black's turn: Jump over a white piece");
        }
      }
      return;
    }

    if (!removalPhase["B"] || !removalPhase["W"]) return;

    if (!selectedTile) {
      if (clickedTile.piece === turn) {
        setSelectedTile(clickedTile);
        const moves = getValidMovesForTile(clickedTile);
        setPossibleMoves(moves);
      }
    } else {
      if (isValidMove(selectedTile, clickedTile)) {
        const newBoard = [...board];
        const dx = clickedTile.row - selectedTile.row;
        const dy = clickedTile.col - selectedTile.col;

        newBoard[clickedTile.row][clickedTile.col] = {
          ...clickedTile,
          piece: turn,
        };
        newBoard[selectedTile.row][selectedTile.col] = {
          ...selectedTile,
          piece: null,
        };

        const middleRow = selectedTile.row + dx / 2;
        const middleCol = selectedTile.col + dy / 2;
        newBoard[middleRow][middleCol] = {
          ...newBoard[middleRow][middleCol],
          piece: null,
        };

        const nextTurn = turn === "B" ? "W" : "B";
        const canMove = hasAnyValidMoves(nextTurn);

        setBoard(newBoard);
        setSelectedTile(null);
        setPossibleMoves([]);

        if (!canMove) {
          setWinner(turn);
          setTurnMessage(`Game Over - ${turn === "B" ? "Black" : "White"} Wins!`);
        } else {
          setTurn(nextTurn);
          setTurnMessage(
            nextTurn === "B"
              ? "Black's turn: Jump over a white piece"
              : "White's turn: Jump over a black piece"
          );
        }
      } else {
        setPossibleMoves([]);
        setSelectedTile(null);
      
      }
    }
  };

  return (
    <div>
      <div className="game-container">
        <h1>Kōnane Game</h1>
        <NavBar />
        <p className="turn-message">{turnMessage}</p>
        <div className="game-board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {row.map((tile, colIndex) => (
                <div
                  key={colIndex}
                  className={`board-tile ${
                    possibleMoves.some(move => move.row === tile.row && move.col === tile.col)
                      ? "highlight"
                      : ""
                  }`}
                  onClick={() => handleTileClick(tile.row, tile.col)}
                  style={{
                    backgroundColor:
                      (rowIndex + colIndex) % 2 === 0 ? "#ffffff" : "#000000",
                  }}
                >
                  {tile.piece && (
                    <img
                      src={tile.piece === "B" ? blackPiece : whitePiece}
                      alt={tile.piece === "B" ? "Black Piece" : "White Piece"}
                      className="piece"
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default GameBoard;
