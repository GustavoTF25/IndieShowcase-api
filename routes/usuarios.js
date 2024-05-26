const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const decodetoken = require('../middleware/decodetoken');
const fileUpload = require('express-fileupload');

/*Rotas de usuários*/
router.use(
    fileUpload({
        limits: { fileSize: 24 * 1024 * 1024  /* mais ou memnos 26MB */ },
        abortOnLimit: true,
    })
);
//pega todos usuários cadastrados
router.get('/', userController.getusuarios);

//pega algum usuário pelo seu id
router.get('/:usu_id', userController.getusuid);

//cadastro e login
router.post('/cadastro', userController.postusuarios);
router.post('/login', userController.loginusuarios);

//editar e deletar usuário
router.patch('/editar', userController.patchnome);
router.delete('/deletar', userController.deleteusuarios);
router.patch('/biografia', userController.patchbio);

//Alteração de senha 
router.post('/esqueci-senha', userController.esquecisenha);
router.post('/nova-senha', userController.novasenha);

//Adicionar nova foto de perfil
router.post('/adicionar-nova-foto', decodetoken.decodifica, userController.fotousuario);

//editar senha
router.patch('/editarsenha', decodetoken.decodifica, userController.patchsenha)


module.exports = router;
