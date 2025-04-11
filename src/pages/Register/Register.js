import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Firebase.js";
import "./Register.scss";
import Header from "../../components/Header/Header.js";
import Footer from "../../components/Footer/Footer.js";

const Register = () => {
  const [userType, setUserType] = useState("volunteer"); // volunteer selected by default
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For volunteer
  const [organizationName, setOrganizationName] = useState(""); // For organization

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registration successful!");

      if (userType === "volunteer") {
        localStorage.setItem("volunteer", email);
        navigate("/volunteer-dashboard");
      } else {
        localStorage.setItem("organization", email);
        navigate("/organization-dashboard");
      }
    } catch (error) {
      console.error("Error registering:", error.message);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="page-container">
      <Header />
      <main className="register-container">
        <h2>Create an Account</h2>

        <p className="intro-text">
          Sign up to get started. Choose your role and complete the form below.
        </p>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="userType"
                value="volunteer"
                checked={userType === "volunteer"}
                onChange={() => setUserType("volunteer")}
              />
              Volunteer
            </label>

            <label>
              <input
                type="radio"
                name="userType"
                value="organization"
                checked={userType === "organization"}
                onChange={() => setUserType("organization")}
              />
              Organization
            </label>
          </div>

          {userType === "volunteer" && (
            <>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}

          {userType === "organization" && (
            <>
              <label htmlFor="organizationName">Organization Name</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                placeholder="Enter organization name"
                className="form-input"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
              />
            </>
          )}

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

          <button type="submit" className="btn register-btn">
            Register
          </button>
        </form>

        <p>Already have an account?</p>
        <div className="button-group">
          <button
            className="btn volunteer-btn"
            onClick={() => navigate("/volunteer-login")}
          >
            Volunteer Login
          </button>

          <button
            className="btn organization-btn"
            onClick={() => navigate("/organization-login")}
          >
            Organization Login
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
