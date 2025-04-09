import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase.js";
import "./PatronLogin.scss";
import lplLogo from "../../assets/lpl-icon-yellow.svg";
import Header from "../../components/Header/Header.js";
import Footer from "../../components/Footer/Footer.js";

const PatronLogin = () => {
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
      localStorage.setItem("patron", email);

      // Redirect to user dashboard
      navigate("/patron-dashboard");
    } catch (error) {
      console.error("Error signing in:", error.message);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <Header />
      <div className="patron-login-container">
        <img src={lplLogo} alt="LPL Logo" className="lpl-logo" />
        <h2>Library Patron Login</h2>
        <form onSubmit={handleLogin}>
          <label>Email:</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?
          <button onClick={() => navigate("/patron-register")}>
            Register here.
          </button>
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default PatronLogin;
