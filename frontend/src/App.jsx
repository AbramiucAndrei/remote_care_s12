// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainClient from "./pages/MainClient";
import WorkerManageBookingsPage from "./pages/WorkerManageBookingsPage.jsx";

import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import ClientBookingsPage from "./pages/ClientBookingsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<ProtectedRoute publicOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<Home />} />

        {/* Client-only */}
        <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
          <Route path="/main_client" element={<MainClient />} />
          <Route path="/client_bookings" element={<ClientBookingsPage />} />
        </Route>

        {/* Worker-only */}
        <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
          <Route path="/main_worker" element={<WorkerManageBookingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
