import { Link, useNavigate } from "react-router-dom";
import "./OrganizationHeader.scss";
import logo from "../../assets/fcv-icon-white.png";

const OrganizationHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    const signOutConfirmation = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (signOutConfirmation) {
      localStorage.removeItem("organization");
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
          <Link to="/organization-applications" className="nav-link">
            Manage Applications
          </Link>
          <Link to="/organization-opportunities" className="nav-link">
            Share Opportunities
          </Link>
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
};

export default OrganizationHeader;
