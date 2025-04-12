import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../Firebase.js";
import "./OrganizationApplications.scss";
import OrganizationHeader from "../../components/OrganizationHeader/OrganizationHeader.js";

const OrganizationApplications = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState({});
  const organizationEmail = localStorage.getItem("organization");

  useEffect(() => {
    if (!organizationEmail) {
      console.warn("No organization session found. Redirecting to login...");
      navigate("/organization-login");
    } else {
      fetchOpportunities();
    }
  }, [navigate, organizationEmail]);

  const fetchOpportunities = async () => {
    try {
      const q = query(
        collection(db, "opportunities"),
        where("organizationEmail", "==", organizationEmail)
      );
      const querySnapshot = await getDocs(q);
      const ops = [];
      const appsByOpp = {};

      for (let docSnap of querySnapshot.docs) {
        const opportunity = { id: docSnap.id, ...docSnap.data() };
        ops.push(opportunity);

        const appsQ = query(
          collection(db, "applications"),
          where("opportunityId", "==", docSnap.id)
        );
        const appsSnap = await getDocs(appsQ);
        appsByOpp[docSnap.id] = appsSnap.docs.map((app) => ({
          id: app.id,
          ...app.data(),
        }));
      }

      setOpportunities(ops);
      setApplications(appsByOpp);
    } catch (error) {
      console.error("Error fetching opportunities or applications:", error);
    }
  };

  const handleRemoveOpportunity = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this opportunity?"
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "opportunities", id));
      setOpportunities(opportunities.filter((o) => o.id !== id));
    } catch (error) {
      console.error("Error removing opportunity:", error);
    }
  };

  const handleUpdateApplicationStatus = async (appId, status) => {
    try {
      await updateDoc(doc(db, "applications", appId), { status });
      fetchOpportunities();
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  return (
    <>
      <OrganizationHeader />
      <div className="organization-applications-container">
        <h2>Manage Applications</h2>
        {opportunities.length === 0 ? (
          <>
            <p className="no-opportunities">
              You haven't shared any opportunities yet.
            </p>
            <button
              className="btn share-btn"
              onClick={() => navigate("/organization-opportunities")}
            >
              Share Opportunities
            </button>
          </>
        ) : (
          opportunities.map((opp) => (
            <div className="opportunity-card" key={opp.id}>
              <div className="opportunity-header">
                <h3>{opp.title}</h3>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveOpportunity(opp.id)}
                >
                  Remove
                </button>
              </div>
              {applications[opp.id]?.length > 0 ? (
                <ul className="applicant-list">
                  {applications[opp.id].map((applicant) => (
                    <li key={applicant.id}>
                      <p>
                        {applicant.volunteerEmail} - Status:{" "}
                        {applicant.status || "Pending"}
                      </p>
                      <div className="action-buttons">
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(
                              applicant.id,
                              "accepted"
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateApplicationStatus(
                              applicant.id,
                              "denied"
                            )
                          }
                        >
                          Deny
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-applicants">
                  No applicants for this opportunity yet.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default OrganizationApplications;
