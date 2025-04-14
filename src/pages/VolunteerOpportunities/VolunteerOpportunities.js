import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
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

      // Get full opportunity data from Firestore
      const oppRef = doc(db, "opportunities", opportunityId);
      const oppDoc = await getDoc(oppRef);
      if (!oppDoc.exists()) {
        alert("Error: Opportunity not found.");
        return;
      }

      const opportunityData = oppDoc.data();

      await addDoc(collection(db, "applications"), {
        createdAt: new Date(),
        volunteerName: fullName,
        volunteerEmail,
        opportunityId,
        title: opportunityData.title,
        description: opportunityData.description,
        organizationName: opportunityData.organizationName,
        location: opportunityData.location,
        startDate: opportunityData.startDate,
        status: "Pending",
      });

      alert("Application submitted successfully!");

      // Remove applied opportunity from the list
      setOpportunities((prev) =>
        prev.filter((opp) => opp.id !== opportunityId)
      );
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("There was an error submitting your application.");
    }
  };

  const groupedOpportunities = opportunities.reduce((acc, opp) => {
    const org = opp.organizationName;
    if (!acc[org]) acc[org] = [];
    acc[org].push(opp);
    return acc;
  }, {});

  return (
    <>
      <VolunteerHeader />
      <div className="volunteer-opportunities-container">
        <h2>Available Opportunities</h2>
        {opportunities.length > 0 && (
          <p className="intro-text">
            Browse volunteer opportunities grouped by organization and apply to
            express your interest in a role.
          </p>
        )}
        {loading ? (
          <p>Loading opportunities...</p>
        ) : Object.keys(groupedOpportunities).length > 0 ? (
          Object.entries(groupedOpportunities).map(([orgName, opps]) => (
            <div key={orgName} className="organization-section">
              <h3 className="organization-heading">{orgName}</h3>
              {opps.map((opp) => (
                <div key={opp.id} className="opportunity-card">
                  <div className="opportunity-header">
                    <h4>{opp.title}</h4>
                    <button
                      className="btn apply-btn"
                      onClick={() => handleApply(opp.id)}
                    >
                      Apply
                    </button>
                  </div>
                  <div className="opportunity-details">
                    <p>
                      <strong>Description:</strong> {opp.description}
                    </p>
                    <p>
                      <strong>Location:</strong> {opp.location}
                    </p>
                    <p>
                      <strong>Start Date:</strong> {opp.startDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="no-opportunities">
            No new opportunities available right now.
          </p>
        )}
      </div>
    </>
  );
};

export default VolunteerOpportunities;
