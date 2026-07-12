import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// Authentication
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

// Dashboard
import Dashboard from "./pages/Dashboard/Dashboard";

// Subjects
import Subjects from "./pages/Subjects/Subjects";
import SubjectDetails from "./pages/Subjects/SubjectDetails";

// Topics
import Topics from "./pages/Topics/Topics";

// Lesson
import Lesson from "./pages/Lesson/Lesson";

// Quiz
import Quiz from "./pages/Quiz/Quiz";

// AI Tutor
import Chat from "./pages/Chat/Chat";

// Progress
import Progress from "./pages/Progress/Progress";

// Settings
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <Routes>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Subjects */}
      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <Subjects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subjects/:id"
        element={
          <ProtectedRoute>
            <SubjectDetails />
          </ProtectedRoute>
        }
      />

      {/* Topics */}
      <Route
        path="/topics"
        element={
          <ProtectedRoute>
            <Topics />
          </ProtectedRoute>
        }
      />

      {/* Lessons */}
      <Route
        path="/lesson/:topicId"
        element={
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        }
      />

      {/* Quiz */}
      <Route
        path="/quiz/:topicId"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />

      {/* AI Tutor */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* Progress */}
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

    </Routes>
  );
}

export default App;