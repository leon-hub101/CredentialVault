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
  const [editCredential, setEditCredential] = useState(null); // State for editing credential
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility

  const fetchCredentials = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/divisions/${divisionId}/credentials`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCredentials(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch credentials"
      );
    }
  }, [divisionId]);

  useEffect(() => {
    console.log("Division ID from frontend:", divisionId);
    fetchCredentials();
  }, [divisionId, fetchCredentials]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCredential({ ...newCredential, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditCredential({ ...editCredential, [name]: value });
  };

  const handleAddCredential = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://localhost:5000/api/divisions/${divisionId}/credentials`,
        newCredential,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Credential added successfully");
      setNewCredential({ name: "", username: "", password: "" });
      await fetchCredentials();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add credential");
    }
  };

  const handleEditCredential = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/divisions/${divisionId}/credentials/${editCredential._id}`,
        editCredential,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Credential updated successfully");
      setIsModalOpen(false);
      setEditCredential(null);
      await fetchCredentials();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update credential"
      );
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this credential?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(
          `http://localhost:5000/api/divisions/${divisionId}/credentials/${credentialId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Credential deleted successfully");
        await fetchCredentials();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete credential"
        );
      }
    }
  };

  const openEditModal = (credential) => {
    setEditCredential(credential);
    setIsModalOpen(true);
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
                <td>••••••••</td>
                <td>
                  <button
                    className="edit"
                    onClick={() => openEditModal(credential)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete"
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

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Credential</h3>
            <form onSubmit={handleEditCredential}>
              <div>
                <label htmlFor="edit-name">Name:</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editCredential?.name || ""}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-username">Username:</label>
                <input
                  type="text"
                  id="edit-username"
                  name="username"
                  value={editCredential?.username || ""}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-password">Password:</label>
                <input
                  type="password"
                  id="edit-password"
                  name="password"
                  value={editCredential?.password || ""}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <button type="submit">Update Credential</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionCredentials;
