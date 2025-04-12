import { Link, useNavigate } from "react-router-dom";
import "./HomeHeader.scss";
import logo from "../../assets/fcv-icon-white.png";

const HomeHeader = () => {
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

export default HomeHeader;
