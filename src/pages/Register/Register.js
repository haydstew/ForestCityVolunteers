import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../Firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "./Register.scss";
import Header from "../../components/Header/Header.js";

const Register = () => {
  const [userType, setUserType] = useState("volunteer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (userType === "volunteer") {
        await setDoc(doc(db, "volunteers", user.uid), {
          fullName: name,
          email: email,
          createdAt: new Date(),
        });

        alert(
          "Registration successful! You can now login using your email and password."
        );
        navigate("/volunteer-login");
      } else {
        await setDoc(doc(db, "organizations", user.uid), {
          organizationName: organizationName,
          email: email,
          createdAt: new Date(),
        });

        alert(
          "Registration successful! You can now login using your email and password."
        );
        navigate("/organization-login");
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
    </div>
  );
};

export default Register;
