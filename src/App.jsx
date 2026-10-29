import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import StudentHome from '@/pages/StudentHome';
import TeacherHome from '@/pages/TeacherHome';
import AcademyHome from '@/pages/AcademyHome';
import TeacherChecklist from '@/pages/TeacherChecklist';
import Profile from '@/pages/Profile';
import RegisterActivity from '@/pages/RegisterActivity';
import Ranking from '@/pages/Ranking';
import Friends from '@/pages/Friends';
import AthleteProfile from '@/pages/AthleteProfile';
import BottomNav from '@/components/BottomNav';

// Guarda rotas que exigem usuário logado.
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
};

// Se já logado, não deixa voltar pra tela de login.
const RedirectIfAuthed = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/student" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/student" element={<RequireAuth><StudentHome /></RequireAuth>} />
      <Route path="/teacher" element={<RequireAuth><TeacherHome /></RequireAuth>} />
      <Route path="/academy" element={<RequireAuth><AcademyHome /></RequireAuth>} />
      <Route path="/teacher-checklist/:classId" element={<RequireAuth><TeacherChecklist /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/register" element={<RequireAuth><RegisterActivity /></RequireAuth>} />
      <Route path="/ranking" element={<RequireAuth><Ranking /></RequireAuth>} />
      <Route path="/friends" element={<RequireAuth><Friends /></RequireAuth>} />
      <Route path="/athlete/:id" element={<RequireAuth><AthleteProfile /></RequireAuth>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="dojo-container">
          <Helmet>
            <title>Dojo App - Academia de Artes Marciais</title>
            <meta name="description" content="Aplicativo completo para gerenciamento de academias de BJJ e Wrestling" />
          </Helmet>

          <AppRoutes />

          <BottomNav />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
