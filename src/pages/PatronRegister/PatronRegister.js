import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../Firebase.js";
import { setDoc, doc } from "firebase/firestore";
import "./PatronRegister.scss";
import lplLogo from "../../assets/lpl-icon-yellow.svg";
import Header from "../../components/Header/Header.js";
import Footer from "../../components/Footer/Footer.js";

const PatronRegister = () => {
  const [formData, setFormData] = useState({
    cardNumber: "",
    pin: "",
    firstName: "",
    lastName: "",
    dob: "",
    postalCode: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Store user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: formData.email,
        role: "patron",
      });

      alert("Registration successful! You can now log in.");
      navigate("/patron-login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <Header />
      <div className="patron-register-container">
        <img src={lplLogo} alt="LPL Logo" className="lpl-logo" />
        <h2>Library Patron Registration</h2>
        <form onSubmit={handleRegister}>
          <h3>Library Card Information</h3>
          <p>
            Please enter your library card number and PIN to verify your
            membership.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Library Card Number:</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="Enter your 14-digit library card number"
                value={formData.cardNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>PIN:</label>
              <input
                type="password"
                name="pin"
                placeholder="Enter your 4-digit library card PIN"
                value={formData.pin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3>Personal Information</h3>
          <p>
            We need your personal details to match our records and complete your
            registration.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Postal Code:</label>
              <input
                type="text"
                name="postalCode"
                placeholder="Enter your postal code"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3>User Account Information</h3>
          <p>
            Create an account by entering your email and setting a secure
            password.
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                placeholder="Enter at least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account?
          <button onClick={() => navigate("/patron-login")}>Login here.</button>
        </p>
      </div>
      <Footer />
    </>
  );
};

export default PatronRegister;
