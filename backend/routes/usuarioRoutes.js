const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const upload = require('../multerConfig'); // Configuración de Multer

// Ruta para crear un usuario con archivo
router.post('/create', upload.single('file'), usuarioController.createUsuario);

// Ruta para descargar un archivo asociado a un usuario
router.get('/download/:id', usuarioController.downloadFile);

module.exports = router;
