import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Dashboard component to display user's assigned divisions and OUs
const Dashboard = ({ user }) => {
  const [divisions, setDivisions] = useState([]);
  const [ous, setOUs] = useState([]);
  const [userDivisionIds, setUserDivisionIds] = useState([]);

  // Fetch and filter divisions and OUs based on user's assignments
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token available for fetch");
        return;
      }
      console.log("Fetching data with user:", user);
      const [divisionsResponse, ousResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/divisions", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/ous", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      console.log("All divisions from API:", divisionsResponse.data);
      console.log("All OUs from API (raw):", ousResponse.data);

      // Handle populated divisions from user.divisions
      const ids = user.divisions.map((div) =>
        typeof div === "object" ? div._id.toString() : div.toString()
      );
      setUserDivisionIds(ids);
      const userDivisions = divisionsResponse.data.filter((division) =>
        ids.includes(division._id.toString())
      );
      setDivisions(userDivisions);
      console.log("User division IDs:", ids);
      console.log("Filtered divisions:", userDivisions);

      // Filter OUs based on user's divisions with explicit string comparison
      const userOUs = ousResponse.data.filter((ou) => {
        const ouDivisionIds = (ou.divisions || []).map((div) =>
          typeof div === "object" ? div._id.toString() : div.toString()
        );
        const hasMatch = ouDivisionIds.some((id) => ids.includes(id));
        console.log(`OU ${ou.name}:`, {
          ouDivisionIds,
          userDivisionIds: ids,
          hasMatch,
        });
        return hasMatch;
      });
      setOUs(userOUs);
      console.log("Filtered OUs:", userOUs);
    } catch (error) {
      toast.error("Failed to load dashboard data: " + error.message);
      console.error("Fetch error:", error);
    }
  }, [user]);

  // Trigger fetch when user prop changes
  useEffect(() => {
    if (user) {
      console.log("Dashboard fetching data for user:", user);
      fetchUserData();
    } else {
      console.log("No user prop provided to Dashboard");
    }
  }, [user, fetchUserData]);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <h3>Your Divisions</h3>
      {divisions.length > 0 ? (
        <div className="dashboard-grid">
          {divisions.map((division) => (
            <Link
              key={division._id}
              to={`/divisions/${division._id}/credentials`}
              className="dashboard-card"
            >
              <h4>{division.name}</h4>
              <p>Click to view credentials</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>No divisions assigned.</p>
      )}

      <h3>Your Organizational Units</h3>
      {ous.length > 0 ? (
        <div className="dashboard-grid">
          {ous.map((ou) => (
            <div key={ou._id} className="dashboard-card">
              <h4>{ou.name}</h4>
              <p>
                Divisions:{" "}
                {ou.divisions
                  .filter((divisionId) =>
                    userDivisionIds.includes(
                      typeof divisionId === "object"
                        ? divisionId._id.toString()
                        : divisionId.toString()
                    )
                  )
                  .map((divisionId) => {
                    const division = divisions.find(
                      (d) =>
                        d._id.toString() ===
                        (typeof divisionId === "object"
                          ? divisionId._id.toString()
                          : divisionId.toString())
                    );
                    return division ? division.name : "";
                  })
                  .join(", ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No organizational units assigned.</p>
      )}
    </div>
  );
};

export default Dashboard;
