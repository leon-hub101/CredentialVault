import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const DivisionCredentials = () => {
  const { divisionId } = useParams();
  const [credentials, setCredentials] = useState([]);
  const [newCredential, setNewCredential] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [editingCredential, setEditingCredential] = useState(null);

  // useCallback to memoize fetchCredentials
  const fetchCredentials = useCallback(async () => {
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
  }, [divisionId]); // Depend on divisionId

  // UseEffect with fetchCredentials as a dependency
  useEffect(() => {
    console.log("Division ID from frontend:", divisionId);
    fetchCredentials();
  }, [divisionId, fetchCredentials]); // Only re-run if divisionId or fetchCredentials changes

  // Handle input changes for new credential form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCredential({ ...newCredential, [name]: value });
  };

  // Function to add new credential
  const handleAddCredential = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/divisions/${divisionId}/credentials`,
        newCredential,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Credential added successfully");
      setNewCredential({ name: "", username: "", password: "" }); // Reset form
      // Refresh the list of credentials
      await fetchCredentials();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add credential");
    }
  };

  // Function to delete a credential
  const handleDeleteCredential = async (credentialId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this credential?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:5000/api/divisions/${divisionId}/credentials/${credentialId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Credential deleted successfully");
        // Refresh the list of credentials
        await fetchCredentials();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete credential"
        );
      }
    }
  };

  // Function to start editing a credential
  const handleEditCredential = (credential) => {
    setEditingCredential({ ...credential, password: "" }); // Don't show the current password for security
  };

  // Function to update a credential
  const handleUpdateCredential = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/divisions/${divisionId}/credentials/${editingCredential._id}`,
        {
          name: editingCredential.name,
          username: editingCredential.username,
          password: editingCredential.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Credential updated successfully");
      setEditingCredential(null); // Close the editing form
      await fetchCredentials(); // Refresh credentials list
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update credential"
      );
    }
  };

  // Handle changes for the editing form
  const handleEditingInputChange = (e) => {
    const { name, value } = e.target;
    setEditingCredential({ ...editingCredential, [name]: value });
  };

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((credential) => (
              <tr key={credential._id}>
                <td>{credential.name}</td>
                <td>{credential.username}</td>
                <td>••••••••</td> {/* Hide password for security */}
                <td>
                  <button onClick={() => handleEditCredential(credential)}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCredential(credential._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No credentials found.</p>
      )}

      {/* Form for adding new credentials */}
      <form onSubmit={handleAddCredential} className="add-credential-form">
        <h3>Add New Credential</h3>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newCredential.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={newCredential.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={newCredential.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Add Credential</button>
      </form>

      {/* Edit Credential Form */}
      {editingCredential && (
        <form
          onSubmit={handleUpdateCredential}
          className="edit-credential-form"
        >
          <h3>Edit Credential</h3>
          <div>
            <label htmlFor="editName">Name:</label>
            <input
              type="text"
              id="editName"
              name="name"
              value={editingCredential.name}
              onChange={handleEditingInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="editUsername">Username:</label>
            <input
              type="text"
              id="editUsername"
              name="username"
              value={editingCredential.username}
              onChange={handleEditingInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="editPassword">Password:</label>
            <input
              type="password"
              id="editPassword"
              name="password"
              value={editingCredential.password}
              onChange={handleEditingInputChange}
              required
            />
          </div>
          <button type="submit">Update Credential</button>
          <button type="button" onClick={() => setEditingCredential(null)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default DivisionCredentials;
