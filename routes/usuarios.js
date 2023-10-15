const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');


router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => { 
        if(error) {return res.status(500).send({error:error})};
        conn.query('SELECT * FROM usu_usuarios');
        return res;
    });
  
});

router.post('/cadastro', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})}
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
            if(err){return res.status(500).send({error: errBcrypt})}
            conn.query('INSERT INTO usu_usuarios (usu_nome, usu_email, usu_senha) VALUES (?,?,?)', [req.body.nome, req.body.email, hash], 
            (error,results) => {
                conn.release();
                if(error) {return res.status(500).send({error:error})}
                response = {
                    mensagem: "Usuário cadastrado!",
                    usuariocriado: {
                        usu_id : results.insertId,
                        nome: req.body.nome,
                        email: req.body.email
                    }
                }
                return res.status(201).send(response);
            })

        })

    })

})


    
module.exports = router;