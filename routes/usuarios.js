const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userController = require('../controllers/userController');
const authlogin = require('../middleware/authlogin');
const fileUpload = require('express-fileupload');




//Rotas
router.get('/', userController.getusuarios);
router.get('/:usu_id', userController.getusuid);
router.post('/cadastro', userController.postusuarios);
router.post('/login', userController.loginusuarios);
router.patch('/editar', userController.patchusuarios);
router.delete('/deletar', userController.deleteusuarios);
router.post('/esqueci-senha', userController.esquecisenha);
router.post('/verifica-senha', authlogin.opcional, userController.verificasenha);
router.post('/nova-senha', userController.novasenha);
router.post('/adicionar-nova-foto', authlogin.opcional, userController.fotousuario);


module.exports = router;