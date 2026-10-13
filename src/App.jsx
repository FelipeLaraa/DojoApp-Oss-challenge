import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import StudentHome from '@/pages/StudentHome';
import TeacherHome from '@/pages/TeacherHome';
import AcademyHome from '@/pages/AcademyHome';
import Schedule from '@/pages/Schedule';
import CheckIn from '@/pages/CheckIn';
import TeacherChecklist from '@/pages/TeacherChecklist';
import Profile from '@/pages/Profile';
import RegisterActivity from '@/pages/RegisterActivity';
import Ranking from '@/pages/Ranking';
import Friends from '@/pages/Friends';
import AthleteProfile from '@/pages/AthleteProfile';
import BottomNav from '@/components/BottomNav';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="dojo-container">
          <Helmet>
            <title>Dojo App - Academia de Artes Marciais</title>
            <meta name="description" content="Aplicativo completo para gerenciamento de academias de BJJ e Wrestling" />
          </Helmet>
          
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/student" element={<StudentHome />} />
            <Route path="/teacher" element={<TeacherHome />} />
            <Route path="/academy" element={<AcademyHome />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/teacher-checklist/:classId" element={<TeacherChecklist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<RegisterActivity />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/athlete/:id" element={<AthleteProfile />} />
          </Routes>
          
          <BottomNav />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;