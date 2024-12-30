const express = require('express');
const cors = require('cors'); // Agrega soporte para CORS
const app = express();
const usuarioRoutes = require('./routes/usuarioRoutes');
const path = require('path');

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para habilitar CORS (permite solicitudes desde el frontend)
app.use(cors({
  origin: ['http://34.133.168.252', 'http://34.58.59.214', 'http://34.111.209.41'], // IP externa del frontend y la IP estática asignada
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Servir archivos estáticos desde Filestore (asegúrate de haber montado correctamente el Filestore)
app.use('/uploads', express.static('/mnt/filestore'));

// Usar las rutas
app.use('/api/usuarios', usuarioRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { // Cambiado para escuchar en todas las interfaces IPv4
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`); // Mensaje de consola actualizado
});

// Endpoint para health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
