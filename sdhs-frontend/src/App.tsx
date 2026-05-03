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
      </Routes>
    </BrowserRouter>
  );
}

export default App;