import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark px-4 py-3 sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fs-3 text-info d-flex align-items-center gap-2" to="/">
          <i className="bi bi-shield-lock-fill"></i>
          <span>BlockDoc</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2 mt-3 mt-lg-0">

            {!user && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/login") ? "text-info" : ""}`} to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/register") ? "text-info" : ""}`} to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}

            {user && (
              <>
                <li className="nav-item me-lg-2">
                  <span className="nav-link text-info fw-semibold">
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name}
                  </span>
                </li>

                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/dashboard") ? "text-info" : ""}`} to="/dashboard">
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/upload") ? "text-info" : ""}`} to="/upload">
                    Upload
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/documents") ? "text-info" : ""}`} to="/documents">
                    My Documents
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/integrity") ? "text-info" : ""}`} to="/integrity">
                    Integrity
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/blockchain") ? "text-info" : ""}`} to="/blockchain">
                    Blockchain
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/activity") ? "text-info" : ""}`} to="/activity">
                    Activity
                  </Link>
                </li>

                <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                  <button onClick={handleLogout} className="btn btn-danger">
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;