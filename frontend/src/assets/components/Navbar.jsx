import React, { useState } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import api from '../../api';

export const Navbar = () => {
   const [isActive, setIsActive] = useState(false);
   const toggleBurger = () => {
      setIsActive(!isActive);
   };

   const navigate = useNavigate();

   const handleLogout = async () => {
      try {
         await api.post('/api/ktagile/users/logout', {}, { withCredentials: true });
         navigate('/');
         window.location.reload();
      } catch (err) {
         console.error('Error al cerrar sesión:', err);
      }
   };

   const closeBurger = () => setIsActive(false);

   return (
      <div>
         <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand" style={{paddingTop: '10px'}}>
               <a className="navbar-item" href={`${import.meta.env.BASE_URL}`} id='logoWeb'>
                  <img src={`${import.meta.env.BASE_URL}/kanban_logo.png`} alt="Logo" />
               </a>

               <a role="button" className={`navbar-burger ${isActive ? 'is-active' : ''}`} aria-label="menu" aria-expanded="false" data-target="navbarBasicExample" onClick={toggleBurger}>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
               </a>
            </div>

            <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
               <div className="navbar-start">
                  <Link className="navbar-item" to="/" style={{fontWeight: 'bold'}} onClick={closeBurger}>
                     Página Principal
                  </Link>
                  <Link className="navbar-item" to="/espacios" style={{fontWeight: 'bold'}} onClick={closeBurger}>
                     Espacios
                  </Link>
                  <Link className="navbar-item" to="/tablero" style={{ fontWeight: 'bold', pointerEvents: 'none', color: 'grey' }} is-disabled>
                     Tablero
                  </Link>
                  <Link className="navbar-item" style={{fontWeight: 'bold', color: '#FF6685'}} onClick={handleLogout}>
                     Cerrar Sesión
                  </Link>
                  
               </div>
            </div>
         </nav>
      </div>
   )
}
