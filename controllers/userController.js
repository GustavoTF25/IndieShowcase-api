const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');


exports.getusuarios = (req, res, next) => {
    mysql.getConnection((error, conn) => { 
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        'SELECT * FROM usu_usuario',
        (error, resultado, fields) => {
            if(error) { return res.status(500).send({error: error})}
            return res.status(200).send({response: resultado});
        }
      );
    });
};

exports.getusuid = (req, res, next) => {
    mysql.getConnection((error, conn) => { 
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        'SELECT * FROM usu_usuario WHERE usu_id = ?',
        [req.params.usu_id],
        (error, resultado, fields) => {
            if(error) { return res.status(500).send({error: error})}
            return res.status(200).send({response: resultado});
        }
      );
    });
};

exports.postusuarios = (req, res, next) => {
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
                    conn.query('INSERT INTO usu_usuario (usu_nome, usu_email, usu_senha) VALUES (?,?,?)', 
                    [req.body.nome, req.body.email, hash], 
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
};

exports.loginusuarios = (req, res, next) => {
    mysql.getConnection((error,conn) =>{
        if(error) {return res.status(500).send({error: error})}
        const query = `SELECT * FROM usu_usuario WHERE usu_email = ?`;
        conn.query(query, [req.body.email], (error, results, fields) =>{
            conn.release();
            if(error) {return res.status(500).send({error: error})};
            if(results.length < 1) {
                return res.status(401).send({mensagem: 'Usuário ou email não encontrado'});
            };
           bcrypt.compare(req.body.senha, results[0].usu_senha, (err, result) => {
            if(err){
                return res.status(401).send({mensagem: 'Senha Incorreta'});
            }
            if(result){
                
                let token = jwt.sign({
                    usu_id: results[0].usu_id,
                    usu_nome: results[0].usu_nome,
                    email: results[0].email, 
                }, process.env.JWT_KEY, {
                    algorithm:'HS512',
                    expiresIn: "2h"
                });
                
                return res.status(200).send({mensagem: 'Autenticado com sucesso',
                token: token
            });
            }
            return res.status(401).send({mensagem : 'Email ou Senha Incorreta'})

           });
        });
    });
};

exports.patchusuarios = (req, res, next) => {
    mysql.getConnection((error,conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(`UPDATE usu_usuario SET usu_nome = ? WHERE usu_id =?`,
        [req.body.nome, req.body.usu_id],
        (error, resultado, fields) => {
            conn.release();
            if(error) { return res.status(500).send({error: error})}
            res.status(202).send({
                mensagem: 'Info editada com sucesso'
        });
       }
      )
   });
 };

 exports.deleteusuarios = (req, res, next) =>{
    mysql.getConnection((error,conn) =>{
        if(error) {return res.status(500).send({error: error})}
        conn.query(`DELETE FROM usu_usuario WHERE usu_id = ?`,
        [req.body.usu_id],
        (error, resultado, fields) => {
            conn.release();
            if(error) { return res.status(500).send({error: error})}
            res.status(202).send({
                mensagem: 'Usuário deletado'
        });
       }
      )
   }); 

};

exports.esquecisenha = async (req, res, results) => {
    const {email} = req.body;
    mysql.getConnection((error,conn) =>{
        if(error) {return res.status(500).send({error: error})}
        const query = `SELECT * FROM usu_usuario WHERE usu_email = ?`;
        conn.query(query, [req.body.email], (error, results, fields) =>{
            conn.release();
            if(error) {return res.status(500).send({error: error})};
            if(results.length < 1) {
                return res.status(401).send({mensagem: 'Usuário ou email não encontrado'});
            };
            
    let resetToken = jwt.sign( {email}, process.env.JWT_KEY, {expiresIn: '1h'});
    //console.log(resetToken);
    const resetLink = `http://localhost:8000/esqueci-senha?token=${resetToken}`;
    const mailOptions = {
    from: 'gustavotet2022@outlook.com.br',
    to: email,
    subject: 'Recuperação de Senha',
    html: `Clique <a href="${resetLink}">aqui</a> para redefinir sua senha.`,
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail de recuperação de senha:', error);
      return res.status(500).json({ error: 'Erro ao enviar e-mail de recuperação de senha' });
    } else {
      console.log('E-mail de recuperação de senha enviado com sucesso:', info.response);
      return res.status(200).json({ message: 'E-mail de recuperação de senha enviado com sucesso' });
    }
  });

});

});

};

exports.verificasenha = async (req, res) => {
    const token = req.query.token; // Obtenha o token da consulta

    // Verifique a validade do token
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
  
      // O token é válido, permita ao usuário redefinir a senha
      res.render('reset-password-form', { token });
    });
};

exports.novasenha = async (req, res) => {
    const { token, newPassword } = req.body;

    // Verifique a validade do token novamente (opcional, mas recomendado)
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
  
      // O token é válido, permita ao usuário redefinir a senha
      // Valide a nova senha e atualize-a no banco de dados
  
      // Após a redefinição bem-sucedida da senha, responda com uma confirmação
      res.status(200).json({ message: 'Senha redefinida com sucesso' });
    });
};
  