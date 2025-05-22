function HowToPlay() {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>How to Play Kōnane</h1>
        <p>Kōnane is an ancient Hawaiian board game for two players, played on a grid filled with alternating black and white pieces.</p>
        
        <h2>Objective</h2>
        <p>The goal is to block your opponent so they cannot make any legal moves.</p>
        
        <h2>Game Setup</h2>
        <p>The board starts completely filled with pieces in a checkerboard pattern. Each player controls one color. The first move removes one piece from the center to start the game.</p>
        
        <h2>How to Move</h2>
        <p>Players take turns jumping one of their pieces over an adjacent opponent piece (only horizontally or vertically) into an empty space, removing the jumped piece from the board. Multiple jumps in one turn are allowed if possible.</p>
        
        <h2>Winning the Game</h2>
        <p>The game ends when a player cannot make a valid move. The other player wins!</p>
      </div>

    );
  }
  
  export default HowToPlay;