import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage.js";
import VolunteerLogin from "./pages/VolunteerLogin/VolunteerLogin.js";
import Register from "./pages/Register/Register.js";
import VolunteerDashboard from "./pages/VolunteerDashboard/VolunteerDashboard.js";
import VolunteerProfile from "./pages/VolunteerDashboard/VolunteerProfile/VolunteerProfile.js";
import OrganizationLogin from "./pages/OrganizationLogin/OrganizationLogin.js";
import OrganizationDashboard from "./pages/OrganizationDashboard/OrganizationDashboard.js";
import FAQ from "./pages/FAQ/FAQ.js";
import "./App.scss";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/volunteer-login" element={<VolunteerLogin />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/volunteer-profile" element={<VolunteerProfile />} />
        <Route path="/organization-login" element={<OrganizationLogin />} />
        <Route
          path="/organization-dashboard"
          element={<OrganizationDashboard />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </Router>
  );
}

export default App;
