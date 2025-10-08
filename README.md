# KTAGILE - Tablero KANBAN
### 🗂️ Tablero KANBAN – Demo

Tablero Kanban funcional desarrollado con React (frontend) y Express + MySQL (backend). Permite gestionar espacios de trabajo y tareas en un flujo visual estilo Kanban.

### ✨ Funcionalidades actuales

* CRUD de espacios de trabajo.
* CRUD de tareas por espacio de trabajo.
* Asignación de tareas a categorías del tablero.

### 🚀 Demo en vivo

🔗 Acceder al demo (www.noecer.com/ktagile)  
👤 Usuario: **user_public**  
🔒 Contraseña: **12345678**  

### 🛠️ Tecnologías utilizadas

* **Frontend**: React, Axios, Vite/CRA, TailwindCSS (si aplicas).
* **Backend**: Node.js, Express, MySQL, dotenv.
* **Infraestructura**: VPS propio (Linux).

### 📥 Instalación local

1. Clonar el repo:
```
git clone https://github.com/noemi98/ktagile.git
cd kanban
```
2. Backend:
```
cd backend
cp .env.example .env   # Configura las credenciales
npm install
npm start
```
3. Frontend:
```
cd ../frontend
cp .env.example .env   # Configura la URL del backend
npm install
npm start
```
4. Abrir en navegador: http://localhost:5173 o http://localhost:3000

### 🗂️ Estructura del proyecto
```
kanban/
│── backend/   # API REST con Express
│── frontend/  # Aplicación React
│── README.md  # Documentación principal
```

### 📌 Roadmap (Próximas mejoras)

- [x] Autenticación con login (datos filtrados por usuario).
- [ ] Drag & drop para mover tareas entre categorías.
- [ ] Colores personalizables por categoría.
- [x] Diseño responsive.
