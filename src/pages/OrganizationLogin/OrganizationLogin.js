import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./OrganizationLogin.scss";
import Header from "../../components/Header/Header.js";

const OrganizationLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const organizationRef = doc(db, "organizations", user.uid);
      const organizationSnap = await getDoc(organizationRef);

      if (organizationSnap.exists()) {
        localStorage.setItem("organization", email);
        navigate("/organization-applications");
      } else {
        alert(
          "Access denied: This account is not registered as an organization."
        );
      }
    } catch (error) {
      console.error("Error signing in:", error.message);
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <Header />
      <main className="organization-login-container">
        <h2>Organization Login</h2>

        <p className="intro-text">
          Welcome back! Please log in to review volunteer applications and
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
    </div>
  );
};

export default OrganizationLogin;
