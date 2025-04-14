import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../Firebase.js";
import "./OrganizationOpportunities.scss";
import OrganizationHeader from "../../components/OrganizationHeader/OrganizationHeader.js";

const OrganizationOpportunities = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const organizationEmail = localStorage.getItem("organization");

  useEffect(() => {
    if (!organizationEmail) {
      console.log(
        "No organization session found. Redirecting to organization login page."
      );
      navigate("/organization-login");
    }
  }, [navigate, organizationEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "opportunities"), {
        title,
        description,
        organizationName,
        organizationEmail,
        location,
        startDate,
        createdAt: new Date(),
      });
      setSuccessMessage("Opportunity shared successfully!");
      setTitle("");
      setDescription("");
      setOrganizationName("");
      setLocation("");
      setStartDate("");
    } catch (error) {
      console.error("Error adding opportunity: ", error);
    }
  };

  return (
    <>
      <OrganizationHeader />
      <div className="organization-opportunities-container">
        <h2>Share Opportunities</h2>
        <p className="intro-text">
          Use the form below to share volunteer opportunities and make them
          visible to volunteers who want to get involved.
        </p>
        <form className="opportunity-form" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            rows="4"
            id="description"
            name="description"
            placeholder="Enter a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label htmlFor="organization">Organization Name</label>
          <input
            type="text"
            id="organization"
            name="organization"
            placeholder="Enter your organization name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
          />

          <div className="form-row">
            <div className="form-column">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Enter a location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="form-column">
              <label htmlFor="date">Start Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit">Submit Opportunity</button>
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
        </form>
      </div>
    </>
  );
};

export default OrganizationOpportunities;
