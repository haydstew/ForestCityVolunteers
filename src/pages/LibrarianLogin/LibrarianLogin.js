import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./LibrarianLogin.scss";
import lplLogo from "../../assets/lpl-icon-yellow.svg";
import Header from "../../components/Header/Header.js";
import Footer from "../../components/Footer/Footer.js";

const LibrarianLogin = () => {
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

        if (userData.role === "librarian") {
          localStorage.setItem("librarian", email);
          navigate("/librarian-dashboard");
        } else {
          alert("Access denied. Only librarians can log in here.");
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
      <div className="librarian-login-container">
        <img src={lplLogo} alt="LPL Logo" className="lpl-logo" />
        <h2>Librarian Login</h2>
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
      </div>
      <Footer />
    </div>
  );
};

export default LibrarianLogin;
