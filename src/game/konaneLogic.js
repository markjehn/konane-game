// konaneLogic.js

function makeBoard(rows, cols) {
    const board = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push((r + c) % 2 === 0 ? 'x' : 'o');
      }
      board.push(row);
    }
    return board;
  }
  
  function makeMove(board, move) {
    const player = pieceAt(board, move[0]);
    return makePlayerMove(board, player, move);
  }
  
  function makePlayerMove(board, player, move) {
    if (isLegalMove(board, player, move)) {
      const newBoard = deepCopy(board);
      for (const jump of interpolateMove(move)) {
        _makeJump(newBoard, jump);
      }
      return newBoard;
    }
    return board;
  }
  
  function _makeJump(board, jump) {
    const mid = midPoint(jump);
    board[mid[0]][mid[1]] = ' ';
    board[jump[1][0]][jump[1][1]] = board[jump[0][0]][jump[0][1]];
    board[jump[0][0]][jump[0][1]] = ' ';
  }
  
  function moveLength(move) {
    return verticalMove(move) ?
      Math.abs(move[0][0] - move[1][0]) :
      Math.abs(move[0][1] - move[1][1]);
  }
  
  function isLegalMove(board, player, move, loud = true) {
    if (!onBoard(board.length, board[0].length, move[1])) {
      if (loud) console.log("Pieces must stay on the board");
      return false;
    }
    if (pieceAt(board, move[0]) !== player) {
      if (loud) console.log("You can only move your own pieces");
      return false;
    }
  
    const length = moveLength(move);
    if (length % 2 === 1) {
      if (loud) console.log("Cannot move an odd number of squares");
      return false;
    }
    if (length === 0) {
      if (loud) console.log("Cannot stay put");
      return false;
    }
  
    const other = player === 'x' ? 'o' : 'x';
    let newBoard = deepCopy(board);
    for (const jump of interpolateMove(move)) {
      if (!isLegalJump(newBoard, player, other, jump)) {
        if (loud) console.log("Illegal move");
        return false;
      }
      _makeJump(newBoard, jump);
    }
  
    return true;
  }
  
  function isLegalJump(board, player, other, jump) {
    return (
      pieceAt(board, jump[0]) === player &&
      pieceAt(board, midPoint(jump)) === other &&
      pieceAt(board, jump[1]) === ' '
    );
  }
  
  function isInitialMove(board) {
    return countPieces(board, ' ') < 2;
  }
  
  function countPieces(board, piece) {
    return board.flat().filter(cell => cell === piece).length;
  }
  
  function interpolateMove(move) {
    const points = [];
    if (horizontalMove(move)) {
      const step = move[0][1] < move[1][1] ? 2 : -2;
      for (let c = move[0][1]; c !== move[1][1] + step; c += step) {
        points.push([move[0][0], c]);
      }
    } else if (verticalMove(move)) {
      const step = move[0][0] < move[1][0] ? 2 : -2;
      for (let r = move[0][0]; r !== move[1][0] + step; r += step) {
        points.push([r, move[0][1]]);
      }
    }
    return points.slice(0, -1).map((pt, i) => [pt, points[i + 1]]);
  }
  
  function midPoint(move) {
    if (horizontalMove(move)) {
      return [move[0][0], (move[0][1] + move[1][1]) / 2];
    }
    if (verticalMove(move)) {
      return [(move[0][0] + move[1][0]) / 2, move[0][1]];
    }
    console.error("Cannot move diagonally");
    return null;
  }
  
  function horizontalMove(move) {
    return move[0][0] === move[1][0];
  }
  
  function verticalMove(move) {
    return move[0][1] === move[1][1];
  }
  
  function pieceAt(board, point) {
    return board[point[0]][point[1]];
  }
  
  function onBoard(rows, cols, point) {
    return (
      point[0] >= 0 && point[0] < rows &&
      point[1] >= 0 && point[1] < cols
    );
  }
  
  function getNeighbors(board, point) {
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    return directions
      .map(([dr, dc]) => [point[0] + dr, point[1] + dc])
      .filter(pt => onBoard(board.length, board[0].length, pt));
  }
  
  function getCorners(board) {
    const rows = board.length;
    const cols = board[0].length;
    return new Set([
      [0, 0], [rows - 1, 0],
      [0, cols - 1], [rows - 1, cols - 1]
    ]);
  }
  
  function getMiddles(board) {
    const rm = (board.length - 1) / 2;
    const cm = (board[0].length - 1) / 2;
    const rowMid = [Math.floor(rm), Math.ceil(rm)];
    const colMid = [Math.floor(cm), Math.ceil(cm)];
    return new Set(
      rowMid.flatMap(r => colMid.map(c => [r, c]))
    );
  }
  
  function getEmptySquares(board) {
    const empties = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c] === ' ') empties.push([r, c]);
      }
    }
    return empties;
  }
  
  function getFirstMovesForX(board) {
    const spots = [...getCorners(board), ...getMiddles(board)];
    return spots.filter(pt => pieceAt(board, pt) === 'x');
  }
  
  function getFirstMovesForO(board) {
    const empties = getEmptySquares(board);
    return getNeighbors(board, empties[0]);
  }
  
  function getLegalMoves(board, symbol) {
    const empties = getEmptySquares(board);
    if (empties.length === 0) return getFirstMovesForX(board);
    if (empties.length === 1) return getFirstMovesForO(board);
  
    const mine = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c] === symbol) mine.push([r, c]);
      }
    }
  
    const moves = [];
    for (const origin of mine) {
      for (const dest of empties) {
        const move = [origin, dest];
        if (isLegalMove(board, symbol, move, false)) {
          moves.push(move);
        }
      }
    }
    return moves;
  }
  
  function linearizeBoard(board) {
    return board.map(row => row.join("")).join("");
  }
  
  function delinearizeBoard(rawBoard, rows, cols) {
    const board = [];
    for (let i = 0; i < rawBoard.length; i += cols) {
      board.push(rawBoard.slice(i, i + cols).split(""));
    }
    return board;
  }
  
  function printBoard(board) {
    console.log(board.map(row => row.join("")).join("\n"));
  }
  
  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  export {
    makeBoard,
    makeMove,
    getLegalMoves,
    isInitialMove,
    linearizeBoard,
    delinearizeBoard,
    printBoard
  };
  