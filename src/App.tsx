import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Design from './pages/Design';
import MyEvents from './pages/MyEvents';
import Settings from './pages/Settings';
import Scanner from './pages/Scanner';
import Admin from './pages/Admin';
import ConfirmAttendance from './pages/ConfirmAttendance';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="design" element={<Design />} />
          <Route path="my-events" element={<MyEvents />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="support" element={<Support />} />
        </Route>
        {/* Guest View & Tools */}
        <Route path="/confirm/:uuid" element={<ConfirmAttendance />} />
        <Route path="/scanner/:event_id" element={<Scanner />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
