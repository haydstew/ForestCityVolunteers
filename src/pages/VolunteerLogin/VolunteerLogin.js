import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase.js";
import "./VolunteerLogin.scss";
import Header from "../../components/Header/Header.js";
import Footer from "../../components/Footer/Footer.js";

const VolunteerLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Sign in user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Login successful
      console.log("Login successful!", userCredential.user);

      // Store session (if needed)
      localStorage.setItem("volunteer", email);

      // Redirect to user dashboard
      navigate("/volunteer-dashboard");
    } catch (error) {
      console.error("Error signing in:", error.message);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <Header />
      <main className="volunteer-login-container">
        <h2>Volunteer Login</h2>

        <p className="intro-text">
          Welcome back! Please log in to access your volunteer dashboard and
          manage your opportunities.
        </p>

        <form className="login-form">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            className="form-input"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            className="form-input"
            required
          />

          <button type="submit" className="btn login-btn" onClick={handleLogin}>
            Login
          </button>
        </form>

        <p>Don't have an account?</p>
        <button
          className="btn register-btn"
          onClick={() => navigate("/register")}
        >
          Register Here
        </button>
      </main>
      <Footer />
    </div>
  );
};

export default VolunteerLogin;
