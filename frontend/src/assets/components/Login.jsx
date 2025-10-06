import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import "../css/login.css"
import api from '../../api';

export const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await api.post('/api/ktagile/users/validate', {
        username,
        password
      },{
        withCredentials: true
      });
  
      console.log('Login exitoso:', response.data);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      if (error.response) {
        console.error('Error de login:', error.response.data.error);
      } else {
        console.error('Error de red:', error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <img src={`${import.meta.env.BASE_URL}/kanban_logo.png`} alt="Logo" />
          <p className="login-subtitle">Inicio de Sesión</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Nombre de usuario</label>
            <input
              id="username"
              type="username"
              className="form-input"
              placeholder="Mi usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <a href="#forgot">¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="login-button">Iniciar sesión</button>
        </form>
      </div>
    </div>
  )
}
