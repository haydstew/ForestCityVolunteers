import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../Firebase.js";
import "./VolunteerApplications.scss";
import VolunteerHeader from "../../components/VolunteerHeader/VolunteerHeader.js";

const VolunteerApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const volunteerEmail = localStorage.getItem("volunteer");

  useEffect(() => {
    if (!volunteerEmail) {
      console.log("No volunteer session found. Redirecting to login.");
      navigate("/volunteer-login");
      return;
    }

    const fetchApplications = async () => {
      try {
        const q = query(
          collection(db, "applications"),
          where("volunteerEmail", "==", volunteerEmail)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    fetchApplications();
  }, [navigate, volunteerEmail]);

  const groupedApplications = applications.reduce((acc, app) => {
    const org = app.organizationName;
    if (!acc[org]) acc[org] = [];
    acc[org].push(app);
    return acc;
  }, {});

  const handleCancelApplication = async (appId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this application?"
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "applications", appId));
      setApplications(applications.filter((app) => app.id !== appId));
    } catch (error) {
      console.error("Error cancelling application:", error);
    }
  };

  return (
    <>
      <VolunteerHeader />
      <div className="volunteer-applications-container">
        <h2>Your Applications</h2>
        {applications.length > 0 && (
          <p className="intro-text">
            View the opportunities you've applied for and track their status.
            You can also cancel applications if needed.
          </p>
        )}
        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <>
            <p className="no-applications">
              You haven't applied for any opportunities yet.
            </p>
            <button
              className="btn browse-btn"
              onClick={() => navigate("/volunteer-opportunities")}
            >
              Browse Opportunities
            </button>
          </>
        ) : (
          Object.entries(groupedApplications).map(([orgName, apps]) => (
            <div key={orgName} className="organization-section">
              <h3 className="organization-heading">{orgName}</h3>
              {apps.map((app) => (
                <div className="application-card" key={app.id}>
                  <div className="application-header">
                    <div className="title-status">
                      <h4>{app.title}</h4>
                      <span
                        className={`status-badge ${app.status.toLowerCase()}`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelApplication(app.id)}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="opportunity-details">
                    <p>
                      <strong>Description:</strong> {app.description}
                    </p>
                    <p>
                      <strong>Location:</strong> {app.location}
                    </p>
                    <p>
                      <strong>Start Date:</strong> {app.startDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default VolunteerApplications;
