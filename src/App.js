import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.js";
import Register from "./pages/Register/Register.js";
import OrganizationLogin from "./pages/OrganizationLogin/OrganizationLogin.js";
import OrganizationApplications from "./pages/OrganizationApplications/OrganizationApplications.js";
import OrganizationOpportunities from "./pages/OrganizationOpportunities/OrganizationOpportunities.js";
import VolunteerLogin from "./pages/VolunteerLogin/VolunteerLogin.js";
import VolunteerApplications from "./pages/VolunteerApplications/VolunteerApplications.js";
import VolunteerOpportunities from "./pages/VolunteerOpportunities/VolunteerOpportunities.js";
import "./App.scss";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/organization-login" element={<OrganizationLogin />} />
        <Route
          path="/organization-applications"
          element={<OrganizationApplications />}
        />
        <Route
          path="/organization-opportunities"
          element={<OrganizationOpportunities />}
        />
        <Route path="/volunteer-login" element={<VolunteerLogin />} />
        <Route
          path="/volunteer-applications"
          element={<VolunteerApplications />}
        />
        <Route
          path="/volunteer-opportunities"
          element={<VolunteerOpportunities />}
        />
      </Routes>
    </Router>
  );
}

export default App;
