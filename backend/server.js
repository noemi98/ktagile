const express = require('express');
const cors = require('cors');
const connection = require('./db');
const app = express();

// Habilitar CORS
app.use(cors());

app.use(express.json());

//Endpoint: Listar espacios de trabajo
app.get('/api/ktagile/spaces/getdata', (req, res) => {
    connection.query('SELECT * FROM spaces WHERE enabled=1', (err, results) => {
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
app.post('/api/ktagile/spaces/insertdata', (req, res) => {
    const { title, description, status} = req.body;
    connection.query('INSERT INTO spaces (title, description, status) VALUES (?, ?, ?)', [title, description, status], (err, results) =>{
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

