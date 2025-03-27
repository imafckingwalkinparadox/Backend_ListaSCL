// Requiriendo las dependencias necesarias
var express = require('express');
var cors = require('cors');
var path = require('path');
var mysql = require('mysql2');
var { createConnection } = require('mysql2');

// Crear una instancia de la aplicación Express
var app = express();

// Usar CORS para permitir solicitudes desde el puerto 5500 (o el origen de tu frontend)
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Aquí puedes ajustar esto al origen de tu frontend
}));

app.use(express.static('public'));

// Middlewares para la configuración básica de Express
app.use(express.json()); // Para parsear JSON en las solicitudes
app.use(express.urlencoded({ extended: false })); // Para parsear formularios

// Configurar la conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Hector.2008',
    database: 'examenLaboratorio'
  });

// Rutas del servidor
app.get('/', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

// Rutas adicionales
app.get('/hola', (req, res) => {
  res.send('¡Hola desde mi backend en Express!');
});

//Login
app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos en la solicitud' });
  }

  const sql = 'SELECT * FROM usuario WHERE correo = ? AND contraseña = ?';
  db.query(sql, [correo, contraseña], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }

    if (results.length > 0) {
      const usuario = {
        id: results[0].id,
        nombre: results[0].nombre,
        correo: results[0].correo,
        rol: results[0].rol
      };

      return res.status(200).json({ mensaje: 'Login exitoso', usuario });
    } else {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
  });
});

//Registro
app.post('/registro', (req, res) => {
  const { nombre, correo, contraseña, rol } = req.body;

  if (!nombre || !correo || !contraseña || !rol) {
    return res.status(400).json({ error: 'Faltan datos en la solicitud' });
  }

  // Verificar si el correo ya está registrado
  const sqlCheck = 'SELECT * FROM usuario WHERE correo = ?';
  db.query(sqlCheck, [correo], (err, results) => {
    if (err) {
      console.error('Error al verificar el correo: ', err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Insertar nuevo usuario en la base de datos
    const sqlInsert = 'INSERT INTO usuario (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)';
    db.query(sqlInsert, [nombre, correo, contraseña, rol], (err, result) => {
      if (err) {
        console.error('Error al registrar el usuario: ', err);
        return res.status(500).json({ error: 'Error al registrar el usuario' });
      }

      res.status(201).json({
        mensaje: 'Usuario registrado con éxito',
        usuario: {
          id: result.insertId,
          nombre,
          correo,
          rol
        }
      });
    });
  });
});

//GET de maestro
app.get('/maestro', (req, res) => {
  const sqlCheck = 'SELECT id, nombre, materia, usuario_id FROM maestro';

  db.query(sqlCheck, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      return res.status(500).json({ error: 'Error al obtener los maestros' });
    }

    // Si hay maestros en la base de datos, los devuelve
    if (results.length > 0) {
      return res.status(200).json(results);
    }

    // Si no hay maestros, crea uno por defecto
    const sqlInsert = 'INSERT INTO maestro (nombre, materia, usuario_id) VALUES (?, ?, ?)';

    db.query(sqlInsert, nuevoMaestro, (err, result) => {
      if (err) {
        console.error('Error al crear el maestro: ', err);
        return res.status(500).json({ error: 'Error al crear el maestro' });
      }

      // Devuelve el maestro recién creado
      res.status(201).json({
        mensaje: 'No había maestros, se creó un maestro por defecto.',
      });
    });
  });
});

//GET ASISTENCIA
app.post('/asistencia', (req, res) => {
  const { fecha, estado, alumno } = req.body;

  if (!fecha || !estado || !alumno) {
      return res.status(400).json({ error: "Fecha, estado y alumno son obligatorios" });
  }

  const sqlInsert = "INSERT INTO asistencia (fecha, estado, alumno) VALUES (?, ?, ?)";
  db.query(sqlInsert, [fecha, estado, alumno], (err, result) => {
      if (err) {
          console.error('Error al insertar la asistencia:', err);
          return res.status(500).json({ error: "Error al agregar la asistencia" });
      }
      res.status(201).json({ mensaje: "Asistencia registrada correctamente", id: result.insertId });
  });
});



//GET alumno
// Obtener todos los alumnos
app.get('/alumno', (req, res) => {
  const sql = 'SELECT * FROM alumno';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta: ', err);
      return res.status(500).json({ error: 'Error al obtener los registros de alumnos' });
    }

    res.status(200).json(results);
  });
});

// Crear nuevo alumno
app.post('/alumno', (req, res) => {
  const { nombre, grado } = req.body;

  const sqlInsert = 'INSERT INTO alumno (nombre, grado) VALUES (?, ?)';
  
  db.query(sqlInsert, [nombre, grado], (err, result) => {
    if (err) {
      console.error('Error al crear el alumno: ', err);
      return res.status(500).json({ error: 'Error al agregar el alumno' });
    }

    res.status(201).json({
      mensaje: 'Alumno agregado exitosamente',
    });
  });
});


// Configurar el puerto en el que se escucharán las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

module.exports = app;