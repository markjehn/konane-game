import React from "react";
import GameBoard from "./GameBoard";

function Game() {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Kōnane Game</h1>
        <GameBoard />
      </div>
    );
  }
  
  export default Game;