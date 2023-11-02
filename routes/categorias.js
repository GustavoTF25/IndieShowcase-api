const express = require('express');
const router = express.Router();
const mysql= require('../mysql').pool;
require('dotenv').config();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.getcategorias);
router.post('/adicionar', categoriaController.postcategorias);


module.exports = router;