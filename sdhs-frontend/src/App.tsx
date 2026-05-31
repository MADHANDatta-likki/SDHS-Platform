import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Home from './pages/Home';
import Login from './pages/Login';
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
        <Route path="/login" element={<Login />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/events/register" element={<EventRegistration />} />
        <Route path="/volunteer/registrations" element={<MyRegistrations />} />
        <Route path="/volunteer/add-volunteers/:registrationId" element={<AddVolunteers />} />
        <Route path="/volunteer/registration/:registrationId" element={<RegistrationDetails />} />
        <Route path="/admin/images" element={<AdminImageUpload />} />
        <Route path="/volunteer/payment/:registrationId" element={<VolunteerPaymentPage />}/>
        <Route path="/admin/dashboard" element={<AdminDashboard />}/>
        <Route path="/admin/payment-verification" element={<AdminPaymentVerification />}/>
        <Route path="/admin/registration-approval" element={<AdminRegistrationApproval />}/>
        <Route path="/admin/participant-approval" element={<AdminParticipantApproval />}/>
        <Route path="/admin/participant-report" element={<AdminParticipantReport />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
