import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Admin user management component
const AdminUserManagement = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [ous, setOUs] = useState([]);

  // Fetch users, divisions, and OUs on mount
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
        console.log("Fetched OUs:", ousResponse.data);
      } catch (error) {
        toast.error("Failed to fetch data: " + error.message);
      }
    };
    fetchData();
  }, []);

  // Update a user's role
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
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      if (user._id === userId) {
        const updatedUser = await axios.get("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(updatedUser.data);
      }
    } catch (error) {
      toast.error("Failed to update role: " + error.message);
    }
  };

  // Assign a division or OU to a user
  const handleAssign = async (userId, divisionId, ouId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/assign-user",
        { userId, divisionId, ouId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User assigned successfully");
      setUsers(
        users.map((u) =>
          u._id === userId
            ? { ...u, divisions: response.data.user.divisions }
            : u
        )
      );
      if (user._id === userId) {
        const updatedUser = await axios.get("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(updatedUser.data);
      }
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(response.data.user);
      }
    } catch (error) {
      toast.error("Failed to assign user: " + error.message);
    }
  };

  // Unassign a division or OU from a user
  const handleUnassign = async (userId, divisionId, ouId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/unassign-user",
        { userId, divisionId, ouId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("User unassigned successfully");
      setUsers(
        users.map((u) =>
          u._id === userId
            ? { ...u, divisions: response.data.user.divisions }
            : u
        )
      );
      if (user._id === userId) {
        const updatedUser = await axios.get("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(updatedUser.data);
      }
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(response.data.user); 
      }
    } catch (error) {
      toast.error("Failed to unassign user: " + error.message);
    }
  };

  // Check if all divisions in an OU are assigned to a user
  const isOUFullyAssigned = (ou, userDivisions) => {
    const ouDivisionIds = ou.divisions.map((div) =>
      typeof div === "object" ? div._id.toString() : div.toString()
    );
    const userDivisionIds = userDivisions.map((div) =>
      typeof div === "object" ? div._id.toString() : div.toString()
    );
    console.log(`Checking OU ${ou.name}:`, { ouDivisionIds, userDivisionIds });
    return (
      ouDivisionIds.length > 0 &&
      ouDivisionIds.every((id) => userDivisionIds.includes(id))
    );
  };

  return (
    <div className="admin-user-management">
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
                checked={selectedUser.divisions.some((id) =>
                  typeof id === "object"
                    ? id._id.toString() === division._id.toString()
                    : id.toString() === division._id.toString()
                )}
                onChange={() =>
                  selectedUser.divisions.some((id) =>
                    typeof id === "object"
                      ? id._id.toString() === division._id.toString()
                      : id.toString() === division._id.toString()
                  )
                    ? handleUnassign(selectedUser._id, division._id, null)
                    : handleAssign(selectedUser._id, division._id, null)
                }
              />
              {division.name}
            </label>
          ))}
          <h4>Organizational Units:</h4>
          {ous.map((ou) => {
            const isChecked = isOUFullyAssigned(ou, selectedUser.divisions);
            return (
              <label key={ou._id}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    console.log(
                      `Toggling OU ${ou.name}, currently checked: ${isChecked}`
                    );
                    if (isChecked) {
                      handleUnassign(selectedUser._id, null, ou._id);
                    } else {
                      handleAssign(selectedUser._id, null, ou._id);
                    }
                  }}
                />
                {ou.name}
              </label>
            );
          })}
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
