const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('./db');
const saltRounds = 10;
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const verifyToken = require('./auth');
const app = express();

// Habilitar CORS
//app.use(cors());

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

//Endpoint: Crear usuario
app.post('/api/ktagile/users/create', (req, res) => {
    const { username, password, firstname, lastname } = req.body;
    if (!username || !password || !firstname || !lastname) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Error al hashear:', err);
            return res.status(500).json({ error: 'Error al procesar contraseña' });
        }
        connection.query(
            'INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, firstname, lastname],
            (err, result) => {
                if (err) {
                    console.error('Error al crear usuario:', err);
                    return res.status(500).json({ error: 'Error al crear usuario' });
                }
                res.status(201).json({ message: 'Usuario creado correctamente', userId: result.insertId });
            }
        );
    });
});

//Endpoint: Validar usuario
app.post('/api/ktagile/users/validate', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM users WHERE username = ? AND enabled = 1 LIMIT 1', [username], (error, results) => {
        if (error) {
            console.error('Error en la consulta:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado o deshabilitado' });
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            if (!match) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }
            //Generar el TOKEN
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            //Enviar el TOKEN al COOKIE
            res.cookie('token', token, {
                httpOnly: true,
                secure: false, // Producción: TRUE
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 día
            });
            res.json({
                message: 'Login exitoso',
                user: { 
                    id: user.id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                }
            });
        });
    });
});

//Endpoint: Obtener datos del usuario
app.get('/api/ktagile/users/info', verifyToken, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname
    });
});

//Endpoint: Cerrar sesión
app.post('/api/ktagile/users/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false, // Producción: TRUE
        sameSite: 'Lax'
    });
    res.json({ message: 'Sesión cerrada correctamente' });
});

//Endpoint: Listar espacios de trabajo
app.get('/api/ktagile/spaces/getdata', verifyToken, (req, res) => {
    const user_id = req.user.id;
    connection.query('SELECT * FROM spaces WHERE enabled=1 and user_id=?', [user_id], (err, results) => {
        if(err){
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});

//Endpoint: Listar tareas de un espacio de trabajo
app.get('/api/ktagile/tasks/getdata/:spaceId', (req, res) => {
    const { spaceId } = req.params;
    connection.query('SELECT * FROM tasks WHERE enabled=1 and spaceId=?', [spaceId], (err, results) => { 
        if(err){
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});

//Endpoint: Insertar un espacio de trabajo
app.post('/api/ktagile/spaces/insertdata', verifyToken, (req, res) => {
    const { title, description, status} = req.body;
    const user_id = req.user.id;
    connection.query('INSERT INTO spaces (user_id, title, description, status) VALUES (?, ?, ?, ?)', [user_id, title, description, status], (err, results) =>{
        if(err){
            return res.status(500).json({error: 'Error al insertar los datos'});
        }
        res.status(201).json({ message: 'Dato insertado correctamente' });
    });
});

//Endpoint: Actualizar un espacio de trabajo
app.put('/api/ktagile/spaces/updatedata/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status} = req.body;
    connection.query('UPDATE spaces SET title=?, description=?, status=? WHERE id=?', [title, description, status, id], (err, results) => {
        if(err){
            return res.status(500).json({error: 'Error al actualizar los datos'});
        }
        res.json({ message: 'Dato actualizado correctamente' });
    });
});

//Endpoint: Deshabilitar un espacio de trabajo
app.put('/api/ktagile/spaces/disabledata/:id', (req, res) => {
    const { id } = req.params;
    connection.query('UPDATE spaces SET enabled=0 WHERE id=?', [id], (err, results) => {
        if(err){
            return res.status(500).json({error: 'Error al deshabilitar los datos'});
        }
        res.json({ message: 'Dato deshabilitado correctamente' });
    });
});

//Endpoint: Nombre del espacio de trabajo
app.get('/api/ktagile/spaces/getname/:spaceId', (req, res) => {
    const { spaceId } = req.params;
    connection.query('SELECT title FROM spaces WHERE id=?', [spaceId], (err, results) => {
	if(err){
	    return res.status(500).json({ error: 'Error al consultar la base de datos' });
	}
	res.json(results);
    });
});

//Endpoint: Listar tareas con estado según espacio de trabajo
app.get('/api/ktagile/tasks/getdatastatus/:spaceId', (req, res) => {
    const { spaceId } = req.params;
    connection.query('SELECT * FROM tasks WHERE enabled=1 and status IS NOT NULL and spaceId=?', [spaceId], (err, results) => {
        if(err){
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});

//Endpoint: Insertar una tarea
app.post('/api/ktagile/tasks/insertdata/:spaceId', (req, res) => {
    const { spaceId } = req.params;
    const { title, description, status, priority, timelimit} = req.body;
    connection.query('INSERT INTO tasks (title, description, status, priority, timelimit, spaceId) VALUES (?, ?, ?, ?, ?, ?)', [title, description, status, priority, timelimit, spaceId], (err, results) =>{
        if(err){
            return res.status(500).json({error: 'Error al insertar los datos'});
        }
        res.status(201).json({ message: 'Dato insertado correctamente' });
    });
});

//Endpoint: Actualizar una tarea
app.put('/api/ktagile/tasks/updatedata/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, timelimit, priority} = req.body;
    connection.query('UPDATE tasks SET title=?, description=?, timelimit=?, priority=? WHERE id=?', [title, description, timelimit, priority, id], (err, results) => {
        if(err){
            return res.status(500).json({error: 'Error al actualizar los datos'});
        }
        res.json({ message: 'Dato actualizado correctamente' });
    });
});

//Endpoint: Deshabilitar una tarea
app.put('/api/ktagile/tasks/disabledata/:id', (req, res) => {
    const { id } = req.params;
    connection.query('UPDATE tasks SET enabled=0 WHERE id=?', [id], (err, results) => {
        if(err){
            return res.status(500).json({error: 'Error al deshabilitar los datos'});
        }
        res.json({ message: 'Dato deshabilitado correctamente' });
    });
});

//Endpoint: Crear categorías
app.post('/api/ktagile/categories/insertdata/:spaceId', (req, res) => {
    const { spaceId } = req.params;
    const { category1, category2, category3, category4, category5, category6} = req.body;
    connection.query('INSERT INTO categories_spaces (category1, category2, category3, category4, category5, category6, spaceId) VALUES (?, ?, ?, ?, ?, ?, ?)', [category1, category2, category3, category4, category5, category6, spaceId], (err, results) =>{
        if(err){
            return res.status(500).json({error: 'Error al insertar los datos'});
        }
        res.status(201).json({ message: 'Dato insertado correctamente' });
    });
});

//Endpoint: Listar las categorías segun el espacio de trabajo
app.get('/api/ktagile/categories/getdata/:spaceId', (req, res) => {
    const { spaceId } = req.params;
    connection.query('SELECT * FROM categories_spaces WHERE enabled=1 and spaceId=?', [spaceId], (err, results) => { 
        if(err){
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});

//Endpoint: Quitar la tarea de la categoria
app.put('/api/ktagile/tasks/quitcategory/:id', (req, res) => {
    const { id } = req.params;
    connection.query('UPDATE tasks SET status=NULL WHERE id=?', [id], (err, results) => {
        if(err){
            return res.status(500).json({error: 'Error al actualizar los datos'});
        }
         res.json({ message: 'Dato actualizado correctamente' });
    });
});

//Endpoint: Actualizar tarea según la categoria
app.put('/api/ktagile/tasks/updatecategory/:id', (req, res) => {
    const { id } = req.params;
    const { assignedCategory: status } = req.body;
    connection.query('UPDATE tasks SET status=? WHERE id=?', [status, id], (err, results) => {
        if(err){
            return res.status(500).json({error: 'Error al actualizar los datos'});
        }
        //Traer el nuevo status/categoría
        const query = `
                SELECT t.id, t.status,
                CASE WHEN t.status = 1 THEN c.category1
                     WHEN t.status = 2 THEN c.category2
                     WHEN t.status = 3 THEN c.category3
                     WHEN t.status = 4 THEN c.category4
                     WHEN t.status = 5 THEN c.category5
                     WHEN t.status = 6 THEN c.category6
                END AS category_name
                FROM tasks t
                JOIN categories_spaces c ON c.spaceId = t.spaceId
                WHERE t.id = ?;
        `;
        connection.execute(query, [id],(selectErr, selectResults) => {
            if(selectErr){
                return res.status(500).json({error: 'Error al obtener datos del registro actualizado'});
            }
            res.json(selectResults[0]);
        });
    });
});


//Iniciar servidor
const port = 3000;

app.listen(port, () => {
    console.log(`Server corriendo en http://localhost:${port}`);
});

