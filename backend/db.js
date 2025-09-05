require('dotenv').config();
const mysql = require('mysql2');

function createConnection(){
   return mysql.createConnection({
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
     });
}

let connection = createConnection();

// Función para reconectar si hay un error
connection.connect(err => {
   if (err) {
      console.error('Error al conectar a la base de datos:', err);
      setTimeout(createConnection, 5000); // Reconectar después de 5s
   }
});

// Manejo de desconexión
connection.on('error', (err) => {
   console.error('Error en la conexión:', err);
   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      connection = createConnection();
   } else {
      throw err;
   }
});

module.exports = connection;
