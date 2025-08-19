import React from "react";
import "./styles.css";
import Home from "./pages/Home";
import PronouncePage from "./pages/PronouncePage";
import Task from "./pages/Task";
import RegisterPage from './pages/Register';
import LoginPage from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Rankings from "./pages/Rankings";
import Vocabulary from "./pages/Vocabulary";
import More from "./pages/More";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />   
          <Route 
            path="/pronounce" 
            element={
              <ProtectedRoute>
                <PronouncePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Rankings />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Task />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vocabulary" 
            element={
              <ProtectedRoute>
                <Vocabulary />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/more" 
            element={
              <ProtectedRoute>
                <More />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
