import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Header.scss";
import logo from "../../assets/fcv-icon-white.png";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <img src={logo} alt="Forest City Volunteers logo" className="logo" />
          <h1>Forest City Volunteers</h1>
        </div>

        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/faq" className="nav-link">
            FAQ
          </Link>
          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
