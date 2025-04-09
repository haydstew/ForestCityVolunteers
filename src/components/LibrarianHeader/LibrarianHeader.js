import { useNavigate } from "react-router-dom";
import "./LibrarianHeader.scss";
import libraryLogo from "../../assets/lpl-logo-blue.svg";

const LibrarianHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    const signOutConfirmation = window.confirm(
      "Are you sure you want to sign out?"
    );

    if (signOutConfirmation) {
      localStorage.removeItem("librarian");
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
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default LibrarianHeader;
