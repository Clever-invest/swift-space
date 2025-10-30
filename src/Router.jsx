import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import AppV1 from './App';
import AppV2 from './App_v2';

export default function Router() {
  // Используем basename для корректной работы с GitHub Pages
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/v1" element={<AppV1 />} />
        <Route path="/v2" element={<AppV2 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
