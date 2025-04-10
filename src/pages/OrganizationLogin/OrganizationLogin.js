import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./OrganizationLogin.scss";
import Header from "../../components/Header/Header.js";
import Footer from "../../components/Footer/Footer.js";

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

      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data from Firestore:", userData);

        if (userData.role === "organization") {
          localStorage.setItem("organization", email);
          navigate("/organization-dashboard");
        } else {
          alert("Access denied. Only organizations can log in here.");
        }
      } else {
        alert("User not found in Firestore.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("Invalid credentials or user not found.");
    }
  };

  return (
    <div className="page-container">
      <Header />
      <main className="organization-login-container">
        <h2>Organization Login</h2>

        <p className="intro-text">
          Welcome back! Please log in to access your organization dashboard and
          manage your volunteer opportunities.
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
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            className="form-input"
            required
            onChange={(e) => setPassword(e.target.value)}
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

export default OrganizationLogin;
