import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const DivisionCredentials = () => {
  const { divisionId } = useParams();
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/divisions/${divisionId}/credentials`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCredentials(response.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch credentials"
        );
      }
    };
    console.log('Division ID from frontend:', divisionId);

    fetchCredentials();
  }, [divisionId]);

  return (
    <div className="credentials-container">
      <h2>Credential Repository</h2>
      {credentials.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((credential) => (
              <tr key={credential._id}>
                <td>{credential.name}</td>
                <td>{credential.username}</td>
                <td>••••••••</td> {/* Hide password for security */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No credentials found.</p>
      )}
    </div>
  );
};

export default DivisionCredentials;
