import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
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
        const oppSnapshot = await getDocs(collection(db, "opportunities"));
        const allOpportunities = oppSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const appQuery = query(
          collection(db, "applications"),
          where("volunteerEmail", "==", volunteerEmail)
        );
        const appSnapshot = await getDocs(appQuery);
        const appliedIds = appSnapshot.docs.map(
          (doc) => doc.data().opportunityId
        );

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

  const handleApply = async (opportunityId) => {
    const confirmApply = window.confirm(
      "Are you sure you want to apply for this opportunity?"
    );
    if (!confirmApply) return;

    try {
      // Get volunteer's full name
      const volunteerQuery = query(
        collection(db, "volunteers"),
        where("email", "==", volunteerEmail)
      );
      const volunteerSnapshot = await getDocs(volunteerQuery);
      if (volunteerSnapshot.empty) {
        alert("Error: Volunteer not found.");
        return;
      }

      const volunteerData = volunteerSnapshot.docs[0].data();
      const fullName = volunteerData.fullName;

      await addDoc(collection(db, "applications"), {
        createdAt: new Date(),
        volunteerName: fullName,
        volunteerEmail: volunteerEmail,
        opportunityId: opportunityId,
        status: "Pending",
      });

      alert("Application submitted successfully!");

      // Remove applied opportunity from list
      setOpportunities((prev) =>
        prev.filter((opp) => opp.id !== opportunityId)
      );
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("There was an error submitting your application.");
    }
  };

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
                  <strong>Description:</strong> {opp.description}
                </p>
                <p>
                  <strong>Date:</strong> {opp.startDate}
                </p>
                <button
                  className="btn apply-btn"
                  onClick={() => handleApply(opp.id)}
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
