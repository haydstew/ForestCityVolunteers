import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage.js";
import PatronLogin from "./pages/PatronLogin/PatronLogin.js";
import PatronRegister from "./pages/PatronRegister/PatronRegister.js";
import PatronDashboard from "./pages/PatronDashboard/PatronDashboard.js";
import PatronProfile from "./pages/PatronDashboard/PatronProfile/PatronProfile.js";
import LibrarianLogin from "./pages/LibrarianLogin/LibrarianLogin.js";
import LibrarianDashboard from "./pages/LibrarianDashboard/LibrarianDashboard.js";
import FAQ from "./pages/FAQ/FAQ.js";
import "./App.scss";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/patron-login" element={<PatronLogin />} />
        <Route path="/patron-register" element={<PatronRegister />} />
        <Route path="/patron-dashboard" element={<PatronDashboard />} />
        <Route path="/patron-profile" element={<PatronProfile />} />
        <Route path="/librarian-login" element={<LibrarianLogin />} />
        <Route path="/librarian-dashboard" element={<LibrarianDashboard />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </Router>
  );
}

export default App;
