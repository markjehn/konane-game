import React, { useCallback, useState, useEffect } from "react";
import "../styles/GameBoard.css";
import NavBar from "./NavBar";
import blackPiece from "../assets/images/black-piece.png";
import whitePiece from "../assets/images/white-piece.png";
import { useLocation } from "react-router-dom";

function GameBoard() {
  const size = 8;

  const createBoard = () => {
    const board = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        const piece = (i + j) % 2 === 0 ? "W" : "B";
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
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const location = useLocation();
  const { mode } = location.state || { mode: "pvp" };
  const [playerColor, setPlayerColor] = useState(null);
  const [history, setHistory] = useState([]);
  const computerDecidesToContinue = () => Math.random() < 0.5; // 50% chance to continue
  const computerMultiJump = (fromTile, currentBoard) => {
    const jumps = getValidJumps(fromTile, currentBoard, turn);
    if (jumps.length === 0) {
      // No more jumps, end turn
      endTurnHelper(currentBoard);
      return;
    }
  
    if (!computerDecidesToContinue()) {
      // AI decides to stop multi-jump, end turn
      endTurnHelper(currentBoard);
      return;
    }
  
    // AI decides to continue, pick a random next jump
    const nextJump = jumps[Math.floor(Math.random() * jumps.length)];
  
    // Perform the jump on a clone board
    const newBoard = cloneBoard(currentBoard);
  
    const dx = nextJump.row - fromTile.row;
    const dy = nextJump.col - fromTile.col;
    const midRow = fromTile.row + dx / 2;
    const midCol = fromTile.col + dy / 2;
  
    newBoard[nextJump.row][nextJump.col].piece = turn;
    newBoard[fromTile.row][fromTile.col].piece = null;
    newBoard[midRow][midCol].piece = null;
  
    setBoard(newBoard);
    setTurnMessage(`${turn === "B" ? "Black" : "White"} (Computer): Continuing multi-jump...`);
  
    // Recursive call with the new position after the jump, with a slight delay for UX
    setTimeout(() => {
      computerMultiJump({ row: nextJump.row, col: nextJump.col, piece: turn }, newBoard);
    }, 800);
  };
  
  


  useEffect(() => {
    if (mode === "pvc") {
      setTurn("B");
      setPlayerColor(null);
    } else {
      setTurn("B");
      setPlayerColor("B");
    }
  }, [mode]);

  useEffect(() => {
    setPulseActive(true);
    const timer = setTimeout(() => setPulseActive(false), 1500);
    return () => clearTimeout(timer);
  }, [turnMessage]);

  useEffect(() => {
    if (winner !== null) {
      setShowWinnerModal(true);
    }
  }, [winner]);

  useEffect(() => {
    if (mode === "pvc" && playerColor && turn !== playerColor && !winner) {
      const timer = setTimeout(() => computerMove(), 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, playerColor, winner]);

  const handlePlayerColorChoice = (color) => {
    setPlayerColor(color);
    setTurn("B");
  };

  const resetGame = () => {
    setBoard(createBoard());
    setTurn("B");
    setSelectedTile(null);
    setRemovalPhase({ B: false, W: false });
    setWinner(null);
    setTurnMessage("Black: Remove one of your stones");
    setPossibleMoves([]);
    setMultiJumpActive(false);
    setHistory([]);
    setShowWinnerModal(false);
  };

  const cloneBoard = (board) => board.map((row) => row.map((tile) => ({ ...tile })));

  const saveHistory = () => {
    const snapshot = {
      board: cloneBoard(board),
      turn,
      selectedTile,
      removalPhase: { ...removalPhase },
      winner,
      turnMessage,
      possibleMoves: [...possibleMoves],
      multiJumpActive,
    };
    setHistory((prev) => [...prev, snapshot]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setBoard(previous.board);
    setTurn(previous.turn);
    setSelectedTile(previous.selectedTile);
    setRemovalPhase(previous.removalPhase);
    setWinner(previous.winner);
    setTurnMessage(previous.turnMessage);
    setPossibleMoves(previous.possibleMoves);
    setMultiJumpActive(previous.multiJumpActive);
    setHistory((prev) => prev.slice(0, -1));
  };

  const isValidMove = (from, to, currentBoard, currentTurn) => {
    const dx = to.row - from.row;
    const dy = to.col - from.col;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if ((absDx === 2 && dy === 0) || (absDy === 2 && dx === 0)) {
      const middleRow = from.row + dx / 2;
      const middleCol = from.col + dy / 2;
      const middle = currentBoard[middleRow][middleCol];
      return middle.piece && middle.piece !== currentTurn && to.piece === null;
    }
    return false;
  };

  const getValidJumps = (tile, currentBoard, currentTurn, direction = null) => {
    const directions = [
      { dx: 2, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: 0, dy: -2 },
    ];

    const jumps = [];
    for (const { dx, dy } of directions) {
      if (direction && (dx !== direction.dx || dy !== direction.dy)) continue;
      const newRow = tile.row + dx;
      const newCol = tile.col + dy;
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const toTile = currentBoard[newRow][newCol];
        if (isValidMove(tile, toTile, currentBoard, currentTurn)) {
          jumps.push({ row: newRow, col: newCol });
        }
      }
    }
    return jumps;
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
    if (winner || (mode === "pvc" && turn !== playerColor)) return;

    const clickedTile = board[row][col];
    if (!removalPhase[turn]) {
      if (clickedTile.piece === turn) {
        saveHistory();
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
      }
      return;
    }

    if (multiJumpActive) {
      if (possibleMoves.some((move) => move.row === row && move.col === col)) {
        saveHistory();
        executeJump(selectedTile, { row, col });
      }
      return;
    }

    if (clickedTile.piece === turn) {
      setSelectedTile(clickedTile);
      const jumps = getValidJumps(clickedTile, board, turn);
      setPossibleMoves(jumps);
      setTurnMessage(`${turn === "B" ? "Black" : "White"}: Select a move`);
      return;
    }

    if (
      selectedTile &&
      possibleMoves.some((move) => move.row === row && move.col === col)
    ) {
      saveHistory();
      executeJump(selectedTile, { row, col });
    } else {
      setSelectedTile(null);
      setPossibleMoves([]);
      setMultiJumpActive(false);
    }
  };

  const executeJump = (fromTile, toTile) => {
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
    const nextJumps = getValidJumps(newSelected, newBoard, turn, { dx, dy });
  
    if (nextJumps.length > 0) {
      if (mode === "pvc" && turn !== playerColor) {
        // For AI, immediately perform multi-jump moves automatically:
        computerMultiJump(newSelected, newBoard);
      } else {
        // Player turn: allow continue multi-jump normally
        setSelectedTile(newSelected);
        setPossibleMoves(nextJumps);
        setMultiJumpActive(true);
        setTurnMessage(`${turn === "B" ? "Black" : "White"}: Continue jumping or End Turn`);
      }
    } else {
      // No more jumps, end turn
      endTurnHelper(newBoard);
    }
  };
  

  const endTurnHelper = (newBoard) => {
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
    setTurn(nextTurn);
    setTurnMessage(
      nextTurn === "B"
        ? "Black's turn: Jump over a white piece"
        : "White's turn: Jump over a black piece"
    );
  };

  const handleEndTurn = () => {
    saveHistory();
    endTurnHelper(board);
  };

  const computerMove = () => {
    if (!removalPhase[turn]) {
      const pieces = [];
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (board[r][c].piece === turn) {
            pieces.push({ row: r, col: c });
          }
        }
      }
      if (pieces.length > 0) {
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        saveHistory();
        const newBoard = cloneBoard(board);
        newBoard[randomPiece.row][randomPiece.col].piece = null;
        setBoard(newBoard);
        setRemovalPhase({ ...removalPhase, [turn]: true });
        setTurn(turn === "B" ? "W" : "B");
        setTurnMessage(
          turn === "B" ? "White: Remove one of your stones" : "Black's turn: Jump over a white piece"
        );
      }
      return;
    }

    const moves = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c].piece === turn) {
          const jumps = getValidJumps(board[r][c], board, turn);
          jumps.forEach((jump) => {
            moves.push({ from: board[r][c], to: jump });
          });
        }
      }
    }

    if (moves.length === 0) {
      setWinner(playerColor);
      setTurnMessage(`Game Over - ${playerColor === "B" ? "Black" : "White"} Wins!`);
      return;
    }

    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    saveHistory();
    executeJump(randomMove.from, randomMove.to);
  };

  return (
    <div>
      <div className="game-container">
        <h1>Kōnane Game</h1>
        <NavBar />
        {mode === "pvc" && playerColor === null && (
          <div className="color-choice-container">
            <p>Choose your color:</p>
            <button onClick={() => handlePlayerColorChoice("B")}>Black</button>
            <button onClick={() => handlePlayerColorChoice("W")}>White</button>
          </div>
        )}
        {(mode === "pvp" || (mode === "pvc" && playerColor !== null)) && (
          <>
            <p className={`turn-message ${pulseActive ? "pulse" : ""}`}>{turnMessage}</p>
            {removalPhase.B && removalPhase.W && (
              <div className="button-container">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="button undo-button"
                >
                  Undo
                </button>
                <button
                  onClick={handleEndTurn}
                  disabled={winner !== null}
                  className="button end-turn-button"
                >
                  End Turn
                </button>
              </div>
            )}
            <div className="game-board">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                  {row.map((tile, colIndex) => (
                    <div
                      key={colIndex}
                      className={`board-tile ${possibleMoves.some(
                        (move) => move.row === tile.row && move.col === tile.col
                      )
                        ? "highlight"
                        : ""
                        } ${selectedTile &&
                          selectedTile.row === tile.row &&
                          selectedTile.col === tile.col
                          ? "selected"
                          : ""
                        }`}
                      onClick={() => handleTileClick(tile.row, tile.col)}
                      style={{
                        backgroundColor:
                          (rowIndex + colIndex) % 2 === 0 ? "#C49E6C" : "#D2B48C",
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
            <button
              className="reset-button"
              onClick={() => setShowResetConfirmation(true)}
            >
              Reset Board
            </button>
            {showResetConfirmation && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>Are you sure you want to reset the board?</p>
              <button
                className="yes-button"
                onClick={() => {
                  resetGame();
                  setShowResetConfirmation(false);
                }}
              >
                Yes
              </button>
              <button
                className="no-button"
                onClick={() => setShowResetConfirmation(false)}
              >
                No
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
      {showWinnerModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Game Over</h2>
      <p>{winner === "B" ? "Black wins!" : "White wins!"}</p>
      <button
        onClick={() => {
          resetGame();
          setShowWinnerModal(false);
        }}
        className="button"
      >
        Play Again
      </button>
      <button
        onClick={() => setShowWinnerModal(false)}
        className="button"
      >
        No
      </button>
    </div>
  </div>
)}
</div>
  );
}

export default GameBoard;
