import NavBar from "./NavBar";
import "../styles/HowToPlay.css";


function HowToPlay() {
  return (
    <>
      <div className="how-to-play-container">
        <h1>Kōnane Game</h1>

        <div className="navbar-wrapper">
          <NavBar />
        </div>

        <h1>How to Play Kōnane</h1>
        <p>
          Kōnane is an ancient Hawaiian board game for two players, played on a
          grid filled with alternating black and white pieces.
        </p>

        <h2>Objective</h2>
        <p>
          Players take turns jumping over an adjacent opponent's piece. They can continue making jumps on their turn until no more moves are possible. The player who makes the final jump wins the game.
        </p>

        <h2>Game Setup</h2>
        <p>
          The board starts completely filled with pieces similar to a checkerboard
          pattern. Each player controls one color. The first move removes one
          piece from the center to start the game.
        </p>

        <h2>How to Move</h2>
        <p>
          Players take turns jumping one of their pieces over an adjacent
          opponent piece (only horizontally or vertically) into an empty space,
          removing the jumped piece from the board. Multiple jumps in one turn
          are allowed if possible, but not required. You can ONLY do multiple jumps in the same direction. You can end turn if you wish to not do multiple jumps.
        </p>

        <h2>Winning the Game</h2>
        <p>
          The game ends when a player cannot make a valid move. The other
          player wins!
        </p>
      </div>
    </>
  );
}

export default HowToPlay;
