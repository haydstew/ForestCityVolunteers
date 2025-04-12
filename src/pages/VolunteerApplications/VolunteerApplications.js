import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
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

  return (
    <>
      <VolunteerHeader />
      <div className="volunteer-applications-container">
        <h2>Your Applications</h2>
        {loading ? (
          <p>Loading your applications...</p>
        ) : applications.length > 0 ? (
          <ul className="applications-list">
            {applications.map((app) => (
              <li key={app.id} className="application-card">
                <h3>{app.opportunityTitle}</h3>
                <p>
                  <strong>Status:</strong> {app.status || "Pending"}
                </p>
                <p>
                  <strong>Submitted:</strong> {app.submittedAt}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-applications">
            <p>You haven't applied for any opportunities yet.</p>
            <button
              className="btn browse-btn"
              onClick={() => navigate("/volunteer-opportunities")}
            >
              Browse Opportunities
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default VolunteerApplications;
