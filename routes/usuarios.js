const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
        //Se já houver email cadastrado
        conn.query('SELECT * FROM usu_usuario WHERE usu_email = ?', [req.body.email], (error,results) => {
            if(error){return res.status(500).send({error: error})}
            if(results.length > 0) {
                res.status(409).send({mensagem: 'usuario já cadastrado!'});
            }else{
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                    if(error){return res.status(500).send({error: errBcrypt})}
                    conn.query('INSERT INTO usu_usuario (usu_nome, usu_email, usu_senha) VALUES (?,?,?)', [req.body.nome, req.body.email, hash], 
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
                    });
                });
            }
        })
    
    });
});

router.post('/login', (req, res, next) =>{
    mysql.getConnection((error,conn) =>{
        if(error) {return res.status(500).send({error: error})}
        const query = `SELECT * FROM usu_usuario WHERE usu_email = ?`;
        conn.query(query, [req.body.email], (error, results, fields) =>{
            conn.release();
            if(error) {return res.status(500).send({error: error})};
            if(results.length < 1) {
                return res.status(401).send({mensagem: 'falha na autenticação'});
            };
           bcrypt.compare(req.body.senha, results[0].usu_senha, (err, result) => {
            if(err){
                return res.status(401).send({mensagem: 'falha na autenticação'});
            }
            if(result){
                let token = jwt.sign({
                    id_usuario: results[0].id_usuario,
                    email: results[0].email 
                }, 'process.env.JWT_KEY', {
                    expiresIn: "1h"
                });
                return res.status(200).send({mensagem: 'Autenticado com sucesso',
                token: token
            });
            }
            return res.status(401).send({mensagem : 'falha na autenticação'})

           });
        });
    });
});

module.exports = router;