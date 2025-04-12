import { useNavigate } from "react-router-dom";
import "./Home.scss";
import HomeHeader from "../../components/HomeHeader/HomeHeader.js";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <HomeHeader />
      <main className="home-container">
        <h2>Welcome to Forest City Volunteers</h2>

        <p className="tagline">Where Community Takes Root.</p>

        <p className="intro-text">
          Discover meaningful volunteer opportunities or post opportunities for
          others to join in London, Ontario. Together, we're building a stronger
          Forest City.
        </p>

        <p>Select your role to get started:</p>

        <div className="button-group">
          <button
            className="btn volunteer-btn"
            onClick={() => navigate("/volunteer-login")}
          >
            I'm a Volunteer
          </button>

          <button
            className="btn organization-btn"
            onClick={() => navigate("/organization-login")}
          >
            I'm an Organization
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
