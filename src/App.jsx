import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import Layout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import VideoLectures from "./pages/VideoLectures";
import QuestionPaper from "./pages/QuestionPaper";
import Notes from "./pages/Notes";
// import UploadPaper from "./pages/UploadPaper";
import List from "./pages/List";
import Profile from "./pages/Profile";
import CurrentAffair from "./pages/CurrentAffair";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import StudentsTable from "./pages/StudentsTable";

function App() {
  // 🔹 Check user credentials in localStorage
  const user = JSON.parse(localStorage.getItem("userCreds") || "null");
  // const isAuthenticated =
  //   user?.email === "abc@gmail.com" && user?.password === "1234";
  const isAuthenticated = true;

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected App Routes */}
          <Route
            path="/app/*"
            element={
              isAuthenticated ? (
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="lectures" element={<VideoLectures />} />
                    <Route path="ca" element={<CurrentAffair />} />
                    <Route path="list" element={<List />} />
                    <Route path="list/:paperId" element={<QuestionPaper />} />
                    <Route path="notes" element={<Notes />} />
                    {/* <Route path="upload" element={<UploadPaper />} /> */}
                    <Route path="students" element={<StudentsTable />} />
                    <Route path="about" element={<About />} />
                    <Route path="profile" element={<Profile />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
