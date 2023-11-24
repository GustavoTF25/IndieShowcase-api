const express = require('express');
const router = express.Router();
require('dotenv').config();
const categoriaController = require('../controllers/categoriaController');

/** 
 * Rotas de Categorias
*/

//Pega todas as categorias cadastradas
router.get('/', categoriaController.getcategorias);

//Adicionar nova categoria
router.post('/adicionar', categoriaController.postcategorias);


module.exports = router;