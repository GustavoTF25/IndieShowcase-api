const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController');

router.get('/', userController.getusuarios);
router.get('/:usu_id', userController.getusuid);
router.post('/cadastro', userController.postusuarios);
router.post('/login', userController.loginusuarios);
router.patch('/editar', userController.patchusuarios);
router.delete('/deletar', userController.deleteusuarios);


module.exports = router;