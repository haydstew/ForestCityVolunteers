import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../Firebase.js";
import "./VolunteerOpportunities.scss";
import VolunteerHeader from "../../components/VolunteerHeader/VolunteerHeader.js";

const VolunteerOpportunities = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const volunteerEmail = localStorage.getItem("volunteer");

  useEffect(() => {
    if (!volunteerEmail) {
      console.log("No volunteer session found. Redirecting to login.");
      navigate("/volunteer-login");
      return;
    }

    const fetchOpportunities = async () => {
      try {
        // Fetch all opportunities
        const oppSnapshot = await getDocs(collection(db, "opportunities"));
        const allOpportunities = oppSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch applications by this volunteer
        const appQuery = query(
          collection(db, "applications"),
          where("volunteerEmail", "==", volunteerEmail)
        );
        const appSnapshot = await getDocs(appQuery);
        const appliedIds = appSnapshot.docs.map(
          (doc) => doc.data().opportunityId
        );

        // Filter opportunities that haven't been applied to
        const available = allOpportunities.filter(
          (opp) => !appliedIds.includes(opp.id)
        );

        setOpportunities(available);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      }
    };

    fetchOpportunities();
  }, [navigate, volunteerEmail]);

  return (
    <>
      <VolunteerHeader />
      <div className="volunteer-opportunities-container">
        <h2>Available Opportunities</h2>
        {loading ? (
          <p>Loading opportunities...</p>
        ) : opportunities.length > 0 ? (
          <ul className="opportunity-list">
            {opportunities.map((opp) => (
              <li key={opp.id} className="opportunity-card">
                <h3>{opp.title}</h3>
                <p>
                  <strong>Organization:</strong> {opp.organizationName}
                </p>
                <p>
                  <strong>Date:</strong> {opp.date}
                </p>
                <p>{opp.description}</p>
                <button
                  className="btn apply-btn"
                  onClick={() =>
                    navigate(`/apply/${opp.id}`, {
                      state: { opportunity: opp },
                    })
                  }
                >
                  Apply
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No new opportunities available right now.</p>
        )}
      </div>
    </>
  );
};

export default VolunteerOpportunities;
