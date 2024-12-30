const fs = require('fs');
const path = require('path');
const { Pool } = require('pg'); // Usaremos pg para interactuar con PostgreSQL

// Configura la conexión con PostgreSQL
const pool = new Pool({
  user: 'postgres',            // Usuario de PostgreSQL
  host: '10.128.0.6',          // Nueva IP interna de la instancia de base de datos
  database: 'adminuser_db',    // Cambia esto al nombre de tu base de datos
  password: '5432',            // Contraseña de PostgreSQL
  port: 5432,                  // Puerto de PostgreSQL
});

// Ruta base del Filestore
const FILESTORE_BASE_PATH = '/mnt/filestore';

// Crear un usuario y guardar el archivo
exports.createUsuario = async (req, res) => {
  try {
    const { nombre, apellido, direccion } = req.body;
    const filePath = req.file ? path.join(FILESTORE_BASE_PATH, req.file.filename) : null; // Ruta absoluta del archivo

    // Guardar datos en PostgreSQL
    const query = `
      INSERT INTO usuarios (nombre, apellido, direccion, file_path)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [nombre, apellido, direccion, filePath];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Usuario creado con éxito',
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario', error });
  }
};

// Descargar un archivo asociado a un usuario
exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la ruta del archivo desde PostgreSQL
    const query = 'SELECT file_path FROM usuarios WHERE id = $1;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0 || !result.rows[0].file_path) {
      return res.status(404).json({ message: 'Archivo no encontrado en la base de datos' });
    }

    const filePath = result.rows[0].file_path; // La ruta ya es absoluta porque usamos FILESTORE_BASE_PATH
    console.log(`Ruta generada para el archivo: ${filePath}`);

    // Verifica si el archivo existe antes de enviarlo
    if (!fs.existsSync(filePath)) {
      console.error(`Archivo no encontrado en el servidor: ${filePath}`);
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }

    // Descargar el archivo
    res.download(filePath, path.basename(filePath)); // Incluye el nombre original del archivo
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    res.status(500).json({ message: 'Error al descargar archivo', error });
  }
};
