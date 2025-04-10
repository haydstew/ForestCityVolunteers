import { Link, useNavigate } from "react-router-dom";
import "./VolunteerHeader.scss";
import libraryLogo from "../../assets/lpl-logo-blue.svg";

const VolunteerHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    const signOutConfirmation = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (signOutConfirmation) {
      localStorage.removeItem("volunteer");
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <a href="https://www.lpl.ca/" target="_blank" rel="noreferrer">
          <img
            src={libraryLogo}
            alt="London Public Library Logo"
            className="logo"
          />
        </a>
        <nav className="nav-links">
          <Link to="/volunteer-dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/volunteer-profile" className="nav-link">
            Profile
          </Link>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
};

export default VolunteerHeader;
