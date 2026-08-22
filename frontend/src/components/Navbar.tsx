import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">

      <Link
        to="/"
        className="navbar-logo"
      >
        StrataForge
      </Link>

      <nav className="navbar-links">

        <Link to="/">
          Strategy Builder
        </Link>

        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/sweep">
          Parameter Sweep
        </Link>

      </nav>

    </header>
  );
}

export default Navbar;