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
  const [loading, setLoading] = useState(true);
  const organizationEmail = localStorage.getItem("email");

  useEffect(() => {
    if (!organizationEmail) {
      console.warn("No organization session found. Redirecting to login...");
      navigate("/organization-login");
    } else {
      fetchOpportunities();
    }
    // eslint-disable-next-line
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
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveOpportunity = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this opportunity and all associated applications?"
    );
    if (!confirmed) return;

    try {
      const appsQ = query(
        collection(db, "applications"),
        where("opportunityId", "==", id)
      );
      const appsSnap = await getDocs(appsQ);

      const deletePromises = appsSnap.docs.map((docSnap) =>
        deleteDoc(doc(db, "applications", docSnap.id))
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, "opportunities", id));

      setOpportunities(opportunities.filter((o) => o.id !== id));
      const updatedApplications = { ...applications };
      delete updatedApplications[id];
      setApplications(updatedApplications);
    } catch (error) {
      console.error(
        "Error removing opportunity and related applications:",
        error
      );
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
        {loading ? (
          <p className="loading-text">
            Loading opportunities and applications...
          </p>
        ) : (
          <>
            {opportunities.length > 0 && (
              <p className="intro-text">
                View volunteer applications for your posted opportunities.
                Accept or decline applicants and manage your listings.
              </p>
            )}
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
                <div key={opp.id} className="opportunity-card">
                  <div className="opportunity-header">
                    <h3>{opp.title}</h3>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveOpportunity(opp.id)}
                    >
                      Remove
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

                  {applications[opp.id]?.length > 0 ? (
                    <ul className="applicant-list">
                      {applications[opp.id].map((applicant) => (
                        <li key={applicant.id}>
                          <div className="applicant-info">
                            <p>
                              <strong>{applicant.volunteerName}</strong> (
                              {applicant.volunteerEmail})
                              <span
                                className={`status-badge ${applicant.status?.toLowerCase()}`}
                              >
                                {applicant.status}
                              </span>
                            </p>
                          </div>
                          <div className="status-dropdown">
                            <label htmlFor={`status-${applicant.id}`}>
                              Change Status:{" "}
                            </label>
                            <select
                              id={`status-${applicant.id}`}
                              value={applicant.status || "Pending"}
                              onChange={(e) =>
                                handleUpdateApplicationStatus(
                                  applicant.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="Pending">Pending</option>
                              <option value="Accepted">Accepted</option>
                              <option value="Declined">Declined</option>
                            </select>
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
          </>
        )}
      </div>
    </>
  );
};

export default OrganizationApplications;
