import { useState } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './assets/components/Navbar';
import { Login } from './assets/components/Login';
import { Home } from './assets/components/Home';
import { TaskBoard } from './assets/components/TaskBoard';
import { Spaces } from './assets/components/Spaces';

import 'bulma/css/bulma.min.css';
console.log(import.meta.env.VITE_API_URL)

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <>
        {isAuthenticated && <Navbar />} {}
        <Routes>
            {!isAuthenticated ? (
            <>
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </>
            ) : (
            <>
                <Route path="/" element={<Home />} />
                <Route path="/tablero/:spaceId" element={<TaskBoard />} />
                <Route path="/espacios" element={<Spaces />} />
                <Route path="*" element={<Navigate to="/" />} />
            </>
            )}
        </Routes>
        </>
    );
}

export default App;
