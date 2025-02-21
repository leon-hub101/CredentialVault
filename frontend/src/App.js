import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./components/Login";
import Register from "./components/Register";
import DivisionCredentials from "./components/DivisionCredentials";
import AdminUserManagement from "./components/AdminUserManagement";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);

  const showToast = (message, type = "success") => {
    const options = {
      toastId: `${type}-${Date.now()}`,
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      closeButton: false,
      pauseOnHover: true,
      draggable: true,
    };
    if (type === "success") {
      toast.success(message, options);
    } else {
      toast.error(message, options);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fetched user data on mount:", response.data);
          console.log("User divisions:", response.data.divisions);
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
          localStorage.removeItem("token");
          setUser(null);
          showToast(
            "Database connection failed. Please try again later.",
            "error"
          );
        }
      } else {
        console.log("No token found in localStorage");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    console.log("User state updated in App.js:", user);
  }, [user]);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route
          path="/dashboard"
          element={<Dashboard user={user} showToast={showToast} />}
        />
        <Route
          path="/divisions/:divisionId/credentials"
          element={<DivisionCredentials />}
        />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin/user-management"
          element={
            <AdminUserManagement
              user={user}
              setUser={setUser}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/"
          element={
            <div className="homepage-container">
              <h1 className="homepage-header">
                Welcome to{" "}
                <span className="credential-vault">CredentialVault</span>
              </h1>
            </div>
          }
        />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick={false}
        closeButton={false}
        pauseOnHover
        draggable
        limit={1}
      />
    </Router>
  );
}

export default App;
