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
  const [multiJumpActive, setMultiJumpActive] = useState(false);
  const [multiJumpPath, setMultiJumpPath] = useState([]);
  

  const cloneBoard = (board) => board.map((row) => row.map((tile) => ({ ...tile })));

  const isValidMove = (from, to, currentBoard, currentTurn) => {
    const dx = to.row - from.row;
    const dy = to.col - from.col;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if ((absDx === 2 && dy === 0) || (absDy === 2 && dx === 0)) {
      const middleRow = from.row + dx / 2;
      const middleCol = from.col + dy / 2;
      const middle = currentBoard[middleRow][middleCol];

      return (
        middle.piece &&
        middle.piece !== currentTurn &&
        to.piece === null
      );
    }
    return false;
  };

  const getValidJumps = (tile, currentBoard, currentTurn) => {
    const directions = [
      { dx: 2, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: 0, dy: -2 },
    ];

    const jumps = [];
    for (const { dx, dy } of directions) {
      const newRow = tile.row + dx;
      const newCol = tile.col + dy;
      if (
        newRow >= 0 && newRow < size &&
        newCol >= 0 && newCol < size
      ) {
        const toTile = currentBoard[newRow][newCol];
        if (isValidMove(tile, toTile, currentBoard, currentTurn)) {
          jumps.push({ row: newRow, col: newCol });
        }
      }
    }
    return jumps;
  };

  const getMultiJumpSequences = (tile, currentBoard, currentTurn, path = [], visited = new Set()) => {
    const key = `${tile.row},${tile.col}`;
    if (visited.has(key)) return [];

    visited.add(key);
    const validJumps = getValidJumps(tile, currentBoard, currentTurn);
    let sequences = [];

    if (validJumps.length === 0) {
      return path.length > 0 ? [path] : [];
    }

    for (const jump of validJumps) {
      const dx = jump.row - tile.row;
      const dy = jump.col - tile.col;
      const midRow = tile.row + dx / 2;
      const midCol = tile.col + dy / 2;

      const nextBoard = cloneBoard(currentBoard);
      nextBoard[tile.row][tile.col].piece = null;
      nextBoard[jump.row][jump.col].piece = currentTurn;
      nextBoard[midRow][midCol].piece = null;

      const newTile = { row: jump.row, col: jump.col, piece: currentTurn };
      const extendedPaths = getMultiJumpSequences(
        newTile,
        nextBoard,
        currentTurn,
        [...path, jump],
        new Set(visited)
      );

      sequences.push(...extendedPaths);
    }

    return sequences;
  };

  const hasAnyValidMoves = (currentTurn, currentBoard = board) => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentBoard[r][c].piece === currentTurn) {
          if (getValidJumps(currentBoard[r][c], currentBoard, currentTurn).length > 0) {
            return true;
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
        const newBoard = cloneBoard(board);
        newBoard[row][col].piece = null;
        setBoard(newBoard);
        setRemovalPhase({ ...removalPhase, [turn]: true });

        if (turn === "B") {
          setTurn("W");
          setTurnMessage("White: Remove one of your stones");
        } else {
          setTurn("B");
          setTurnMessage("Black's turn: Jump over a white piece");
        }
        return;
      }
      return;
    }

    if (multiJumpActive) {
      const nextStep = multiJumpPath[0];
      if (nextStep && nextStep.row === row && nextStep.col === col) {
        executeJump(selectedTile, clickedTile);
        setMultiJumpPath(multiJumpPath.slice(1));
      }
      return;
    }

    if (clickedTile.piece === turn) {
      setSelectedTile(clickedTile);
      const sequences = getMultiJumpSequences(clickedTile, board, turn);
      const flatMoves = [...new Set(sequences.map(seq => JSON.stringify(seq[0])))].map(str => JSON.parse(str));
      setPossibleMoves(flatMoves);
      setMultiJumpActive(false);
      setTurnMessage(`${turn === "B" ? "Black" : "White"}: Select a piece to jump`);
      return;
    }

    if (selectedTile && possibleMoves.some(move => move.row === row && move.col === col)) {
      const sequences = getMultiJumpSequences(selectedTile, board, turn);
      const path = sequences.find(seq => seq[0].row === row && seq[0].col === col);

      if (path && path.length > 0) {
        setMultiJumpPath(path.slice(1));
        executeJump(selectedTile, { row, col }, true);
      }
    } else {
      setSelectedTile(null);
      setPossibleMoves([]);
      setMultiJumpActive(false);
    }
  };

  const executeJump = (fromTile, toTile, isInitial = false) => {
    const newBoard = cloneBoard(board);
    const dx = toTile.row - fromTile.row;
    const dy = toTile.col - fromTile.col;
    const midRow = fromTile.row + dx / 2;
    const midCol = fromTile.col + dy / 2;

    newBoard[toTile.row][toTile.col].piece = turn;
    newBoard[fromTile.row][fromTile.col].piece = null;
    newBoard[midRow][midCol].piece = null;

    setBoard(newBoard);

    const newSelected = { row: toTile.row, col: toTile.col, piece: turn };
    const nextJumps = getValidJumps(newSelected, newBoard, turn);

    if (nextJumps.length > 0 && (multiJumpPath.length > 0 || isInitial)) {
      const continueJump = window.confirm("You can continue jumping. Do you want to continue?");
      if (continueJump) {
        setSelectedTile(newSelected);
        setPossibleMoves(nextJumps);
        setMultiJumpActive(true);
        setTurnMessage(`${turn === "B" ? "Black" : "White"}: Continue jumping`);
        return;
      }
    }

    const nextTurn = turn === "B" ? "W" : "B";
    if (!hasAnyValidMoves(nextTurn, newBoard)) {
      setWinner(turn);
      setTurnMessage(`Game Over - ${turn === "B" ? "Black" : "White"} Wins!`);
      setTurn(nextTurn);
      return;
    }

    setSelectedTile(null);
    setPossibleMoves([]);
    setMultiJumpActive(false);
    setMultiJumpPath([]);
    setTurn(nextTurn);
    setTurnMessage(
      nextTurn === "B"
        ? "Black's turn: Jump over a white piece"
        : "White's turn: Jump over a black piece"
    );
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
                    possibleMoves.some(
                      (move) => move.row === tile.row && move.col === tile.col
                    )
                      ? "highlight"
                      : ""
                  } ${
                    selectedTile &&
                    selectedTile.row === tile.row &&
                    selectedTile.col === tile.col
                      ? "selected"
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
