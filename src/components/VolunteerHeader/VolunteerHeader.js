import { Link, useNavigate } from "react-router-dom";
import "./VolunteerHeader.scss";
import logo from "../../assets/fcv-icon-white.png";

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
        <div className="header-logo">
          <img src={logo} alt="Forest City Volunteers logo" className="logo" />
          <h1>Forest City Volunteers</h1>
        </div>
        <nav className="nav-links">
          <Link to="/volunteer-applications" className="nav-link">
            My Applications
          </Link>
          <Link to="/volunteer-opportunities" className="nav-link">
            Find Opportunities
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
