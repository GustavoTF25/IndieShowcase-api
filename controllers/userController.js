const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');
const fs = require('fs');  
const mime = require('mime-types');

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
        if (!req.body.nome || !req.body.email || !req.body.senha) {
            conn.release();
            return res.status(400).send({ mensagem: 'Todos os campos são obrigatórios' });
        }
      conn.query('SELECT * FROM usu_usuario WHERE usu_email = ?', [req.body.email], (error,results) => {
          if(error){return res.status(500).send({error: error})}
          if(results.length > 0) {
              res.status(409).send({mensagem: 'usuario já cadastrado!'});
                  }else{
                      bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                          if(error){return res.status(500).send({error: errBcrypt})}
                          let imagemCaminho = 'usuarios/fotos/foto.jpeg'
                          conn.query('INSERT INTO usu_usuario (usu_nome, usu_email, usu_senha, usu_foto) VALUES (?,?,?,?);', 
                          [req.body.nome, req.body.email, hash, imagemCaminho],   
                          (error,results) => {
                          conn.release();
                          let userId = results.insertId;                          
                          let diretorio = `usuarios/fotos/${userId}/`;
                          if (!fs.existsSync(diretorio)) {fs.mkdirSync(diretorio, { recursive: true });
                          if(error){return res.status(500).send({error: error})}
                              return res.status(201).send({
                              mensagem: "Usuário cadastrado!",
                              usuariocriado: {
                                  usu_id : results.insertId,
                                  nome: req.body.nome,
                                  email: req.body.email,
                                  foto:  imagemCaminho,
                                  diretorio: diretorio
                                  }
                              });
                          }
                        });
                  }) 
              } 
          }) 
      }); 
     
  };


  exports.fotousuario = (req, res, next) =>
  {
      mysql.getConnection((error,conn) => {
      let usuarioId = req.user.usu_id;
      let {foto} = req.files;
      if(!isImagem(foto)){return res.status(400).send({mensagem: "Arquivo nao suportado"})}  
     
      if(foto){
          imagemCaminho = `usuarios/fotos/${usuarioId}/` +foto.name;
          if(!fs.existsSync(`usuarios/fotos/${usuarioId}/`)){fs.mkdirSync(`usuarios/fotos/${usuarioId}`), {recursive: true}};
          fs.readdirSync(`usuarios/fotos/${usuarioId}`).forEach(f => fs.rmSync(`usuarios/fotos/${usuarioId}/${f}`));
          foto.mv(imagemCaminho);  
      }else{
          imagemCaminho = 'usuarios/fotos/foto.png' ; 
      }
      conn.query(`UPDATE usu_usuario SET usu_foto = (?) WHERE usu_id = ${usuarioId}`,
      [imagemCaminho],(error,results) => { 
          conn.release();
          return res.status(201).send({
              mensagem: "Foto alterada com sucesso!",
              usuariocriado: {
                  usu_id: usuarioId,
                  foto:  imagemCaminho
                  }
              });
          });
      });
  }
  function isImagem(file){
      let extensao = file.name.split('.').pop();
      let mimeType = mime.lookup(extensao)
      return mimeType && mimeType.startsWith('image');
  } 

  exports.loginusuarios = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({ error: error });
        }
        const { email, senha } = req.body;
        if (!email || !senha) {
            conn.release();
            return res.status(400).send({ mensagem: 'E-mail e senha são obrigatórios' });
        }
        const query = 'SELECT * FROM usu_usuario WHERE usu_email = ?';
        conn.query(query, [email], (error, results) => {
            conn.release();
            if (error) {
                return res.status(500).send({ error: error });
            }
            if (results.length < 1) {
                return res.status(404).send({ mensagem: 'Usuário ou e-mail não encontrado' });
            }
            bcrypt.compare(senha, results[0].usu_senha, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Senha incorreta' });
                }
                if (result) {
                    const token = jwt.sign({
                        usu_id: results[0].usu_id,
                        usu_nome: results[0].usu_nome,
                        email: results[0].usu_email,
                        usu_foto:results[0].usu_foto
                    }, process.env.JWT_KEY, {
                        algorithm: 'HS512',
                        expiresIn: 10800,
                    });
                    return res.status(200).send({
                        mensagem: 'Autenticado com sucesso',
                        token: token,
                    });
                };
                return res.status(401).send({ mensagem: 'Email Incorreto' });
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

exports.esquecisenha = (req, res, results) => {
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
    const resetLink = `http://localhost:3000/alterarSenha?token=${resetToken}`;
    const mailOptions = {
    from: 'indieshowcase@outlook.com.br',
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

exports.verificasenha =  (req, res) => {
    const token = req.query.token;
    console.log('Token recebido:', token);

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        console.error('Erro ao verificar o token:', err);
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      }
      console.log('Token decodificado:', decoded.email);
      res.render('reset-password-form', { token });
    });
};

exports.novasenha = (req, res) => {
  const token = req.query.token;
  const {senha} = req.body;

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    bcrypt.hash(senha, 10, (err, hash) => {
      if (err) {
        return res.status(500).send({ message: 'nova senha', error: err });
      }

      mysql.getConnection((error, conn) => {
        if (error) {
          return res.status(500).send({ message: 'Falha na conexão com o banco de dados', error: error });
        }

        conn.query(`UPDATE usu_usuario SET usu_senha = ? WHERE usu_email = ?`, [hash, decoded.email], (error, results) => {
          conn.release();

          if (error) {
            return res.status(500).send({ error: error });
          }

          if (results.affectedRows === 0) {
            return res.status(404).send({ message: 'Usuário não encontrado' });
          }

          res.status(200).json({ message: 'Senha redefinida com sucesso' });
        });
      });
    });
  });
};
