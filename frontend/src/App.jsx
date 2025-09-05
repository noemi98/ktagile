import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './assets/components/Navbar';
import {Home} from './assets/components/Home';
import {TaskBoard} from './assets/components/TaskBoard';
import {Spaces} from './assets/components/Spaces';

import 'bulma/css/bulma.min.css';


function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tablero/:spaceId" element={<TaskBoard />} />
        <Route path="/espacios" element={<Spaces />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
