import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [ous, setOUs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersResponse, divisionsResponse, ousResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/api/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/divisions", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/ous", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setUsers(usersResponse.data);
        setDivisions(divisionsResponse.data);
        setOUs(ousResponse.data);
      } catch (error) {
        toast.error("Failed to fetch data: " + error.message);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/admin/change-role/${userId}`,
        { newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Role updated successfully");
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      toast.error("Failed to update role: " + error.message);
    }
  };

  const handleAssign = async (userId, divisionId, ouId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/admin/assign-user",
        { userId, divisionId, ouId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User assigned successfully");
      // Update user's divisions
    } catch (error) {
      toast.error("Failed to assign user: " + error.message);
    }
  };

  const handleUnassign = async (userId, divisionId, ouId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/admin/unassign-user",
        { userId, divisionId, ouId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User unassigned successfully");
      // Update user's divisions
    } catch (error) {
      toast.error("Failed to unassign user: " + error.message);
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Divisions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="management">Management</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                {user.divisions.map((divisionId) => {
                  const division = divisions.find((d) => d._id === divisionId);
                  return division ? (
                    <div key={divisionId}>{division.name}</div>
                  ) : null;
                })}
              </td>
              <td>
                <button onClick={() => setSelectedUser(user)}>
                  Edit Assignments
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedUser && (
        <div>
          <h3>Edit Assignments for {selectedUser.username}</h3>
          <h4>Divisions:</h4>
          {divisions.map((division) => (
            <label key={division._id}>
              <input
                type="checkbox"
                checked={selectedUser.divisions.includes(division._id)}
                onChange={() =>
                  handleAssign(selectedUser._id, division._id, null)
                }
              />
              {division.name}
              <button
                onClick={() =>
                  handleUnassign(selectedUser._id, division._id, null)
                }
              >
                Unassign
              </button>
            </label>
          ))}
          <h4>Organizational Units:</h4>
          {ous.map((ou) => (
            <label key={ou._id}>
              <input
                type="checkbox"
                onChange={() => handleAssign(selectedUser._id, null, ou._id)}
              />
              {ou.name}
              <button
                onClick={() => handleUnassign(selectedUser._id, null, ou._id)}
              >
                Unassign
              </button>
            </label>
          ))}
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
