import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import DivisionCredentials from "./components/DivisionCredentials";
import AdminUserManagement from "./components/AdminUserManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/divisions/:divisionId/credentials"
          element={<DivisionCredentials />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<h1>Welcome to your CredentialVault</h1>} />
        <Route
          path="/admin/user-management"
          element={<AdminUserManagement />}
        />
      </Routes>
    </Router>
  );
}

export default App;
