import React from 'react'
import { Link } from 'react-router-dom'

export const Navbar = () => {
   return (
      <div>
         <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
               <a className="navbar-item" href="https://bulma.io" id='logoWeb'>
                  <img src="../public/kanban_logo.png" alt="Logo" />
               </a>

               <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
                  <span aria-hidden="true"></span>
               </a>
            </div>

            <div id="navbarBasicExample" className="navbar-menu">
               <div className="navbar-start">
                  <Link className="navbar-item" to="/" style={{fontWeight: 'bold'}}>
                     Página Principal
                  </Link>
                  <Link className="navbar-item" to="/espacios" style={{fontWeight: 'bold'}}>
                     Espacios
                  </Link>
                  <Link className="navbar-item" to="/tablero" style={{ fontWeight: 'bold', pointerEvents: 'none', color: 'grey' }} is-disabled>
                     Tablero
                  </Link>
               </div>
            </div>
         </nav>
      </div>
   )
}
