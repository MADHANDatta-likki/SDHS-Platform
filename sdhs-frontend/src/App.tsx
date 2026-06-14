import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Home from './pages/Home';
import JoinUs from './pages/JoinUs';
import Login from './pages/Login';
import AdminRoute from './components/AdminRoute';
import VolunteerDashboard from './pages/VolunteerDashboard';
import EventRegistration from './pages/EventRegistration';
import MyRegistrations from './pages/MyRegistrations';
import AddVolunteers from './pages/AddVolunteers';
import RegistrationDetails from './pages/RegistrationDetails';
import AdminImageUpload from './pages/AdminImageUpload';
import VolunteerPaymentPage from './pages/VolunteerPaymentPage';
import AdminPaymentVerification from './pages/AdminPaymentVerification';
import AdminRegistrationApproval from './pages/AdminRegistrationApproval';
import AdminParticipantApproval from './pages/AdminParticipantApproval';
import AdminParticipantReport from './pages/AdminParticipantReport';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventManagement from './pages/AdminEventManagement';
import AdminVolunteerApplicants from './pages/AdminVolunteerApplicants';
import AdminLanding from './pages/AdminLanding';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join-us" element={<JoinUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/landing" element={<AdminRoute><AdminLanding /></AdminRoute>} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/events/register" element={<EventRegistration />} />
        <Route path="/volunteer/registrations" element={<MyRegistrations />} />
        <Route path="/volunteer/add-volunteers/:registrationId" element={<AddVolunteers />} />
        <Route path="/volunteer/registration/:registrationId" element={<RegistrationDetails />} />
        <Route path="/admin/images" element={<AdminRoute><AdminImageUpload /></AdminRoute>} />
        <Route path="/volunteer/payment/:registrationId" element={<VolunteerPaymentPage />}/>
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
        <Route path="/admin/events" element={<AdminRoute><AdminEventManagement /></AdminRoute>}/>
        <Route path="/admin/volunteer-applicants" element={<AdminRoute><AdminVolunteerApplicants /></AdminRoute>}/>
        <Route path="/admin/payment-verification" element={<AdminRoute><AdminPaymentVerification /></AdminRoute>}/>
        <Route path="/admin/registration-approval" element={<AdminRoute><AdminRegistrationApproval /></AdminRoute>}/>
        <Route path="/admin/participant-approval" element={<AdminRoute><AdminParticipantApproval /></AdminRoute>}/>
        <Route path="/admin/participant-report" element={<AdminRoute><AdminParticipantReport /></AdminRoute>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
