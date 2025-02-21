import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); 
  const isAdmin = localStorage.getItem("role") === "admin"; 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username.trim() || !password.trim()) {
      return toast.error("Username and password are required.");
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
        role: isAdmin ? role : undefined, 
      });

      if (response.status === 201) {
        toast.success("Registration successful!");
        navigate("/login"); 
      } else {
        throw new Error("Unexpected server response.");
      }
    } catch (error) {
      let errorMessage = "An error occurred during registration.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.data.detailedError) {
          console.error(
            "Detailed error from server:",
            error.response.data.detailedError
          );
        }
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isAdmin && (
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="management">Management</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
