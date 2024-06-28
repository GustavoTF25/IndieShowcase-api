//const pg = require('../pg').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');
const fs = require('fs');
const mime = require('mime-types');
require('dotenv').config();
const pg = require('../pg').pool;


exports.getusuarios = (req, res, next) => {
  pg.connect((error, client, done) => {
    if (error) { return res.status(500).send({ error: error, message: 'Erro na conexão com o banco de dados', errorDetails: error.message });    }
     
    client.query(`select * from usu_usuario`  , (error, result) => {
      done();
      if (error) {
        done();
        return res.status(500).send({ error: error, message: 'Erro na consulta ao banco de dados' });
      }
        
      return res.status(200).send({ response: result.rows });
    });
   
    }) ;
 
};
exports.getusuidperfil = (req, res, next) => {
  const userid = req.user.usu_id;
  pg.connect((error, conn, done) => {
    if (error) { return res.status(500).send({ error: error }) };
    conn.query(
      'SELECT * FROM usu_usuario WHERE usu_id = $1',
      [userid],
      (error, resultado, fields) => {
        
        conn.query(` UPDATE usu_usuario 
              SET usu_totalpublicacao = (
                  SELECT COUNT(*)
                  FROM pos_postagem 
                  WHERE pos_postagem.usu_id = usu_usuario.usu_id 
              )
              WHERE usu_id IN (SELECT DISTINCT usu_id FROM pos_postagem)`, (error, resultado, fields)=>{
            done();
          })
        if (error) { return res.status(500).send({ error: error }) }
        return res.status(200).send({ response: resultado.rows });
      }
    );
  });
};

exports.getusuid = (req, res, next) => {
  pg.connect((error, conn, done) => {
    if (error) { return res.status(500).send({ error: error }) };
    conn.query(
      'SELECT * FROM usu_usuario WHERE usu_id = $1',
      [req.params.usu_id],
      (error, resultado, fields) => {
        conn.query(` UPDATE usu_usuario 
          SET usu_totalpublicacao = (
              SELECT COUNT(*)
              FROM pos_postagem 
              WHERE pos_postagem.usu_id = usu_usuario.usu_id 
          )
          WHERE usu_id IN (SELECT DISTINCT usu_id FROM pos_postagem)`, (error, resultado, fields)=>{
        done();
      })
        if (error) { return res.status(500).send({ error: error }) }
        return res.status(200).send({ response: resultado.rows });
      }
    );
  });
};

exports.postusuarios = (req, res, next) => {
  if (!req.body.nome || !req.body.email || !req.body.senha) {
      return res.status(400).send({ mensagem: 'Todos os campos são obrigatórios' });
    }
  pg.connect((error,conn ,done) => {
    if (error) {
      done(); 
      return res.status(500).send({ error: error, message: 'erro na conexão com o banco' })
    }
    
    conn.query('SELECT * FROM usu_usuario WHERE usu_email = $1', [req.body.email], (error, results) => {
      if (error) { return res.status(500).send({ error: error , message: 'Email ja cadastrado'}) }
      if (results.rows.length > 0) {
        res.status(409).send({ mensagem: 'usuario já existe!' });
      } else {
        bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
          if (error) { return res.status(500).send({ error: errBcrypt }) }
          let imagemCaminho = 'usuarios/fotos/foto.jpeg'
          conn.query('INSERT INTO usu_usuario (usu_nome, usu_email, usu_senha,usu_idade, usu_foto) VALUES ($1,$2,$3,$4,$5) RETURNING usu_id;',
            [req.body.nome, req.body.email, hash,req.body.idade, imagemCaminho],
            (error, results, fields) => {
              let userId = results.rows[0].usu_id;  
              console.log("usuario id ",userId);            
              let diretorio = `usuarios/fotos/${userId}/`;
              if (!fs.existsSync(diretorio)) {
                
                fs.mkdirSync(diretorio, { recursive: true });
                if (error) { 
                  done();
                  return res.status(500).send({ error: error , message : 'erro ao criar diretório'}) }
              }
              done();
                return res.status(201).send({
                  mensagem: "Usuário cadastrado!",
                  usuariocriado: {
                    usu_id: userId,
                    nome: req.body.nome,
                    email: req.body.email,
                    idade: req.body.idade,
                    foto: imagemCaminho,
                    diretorio: diretorio
                  }
                });
              
            });
        })
      }
    })
  });

};


exports.fotousuario = (req, res, next) => {
  pg.connect((error, conn,done) => {
    let usuarioId = req.user.usu_id;
    let { foto } = req.files;
    if (!isImagem(foto)) { return res.status(400).send({ mensagem: "Arquivo nao suportado" }) }

    if (foto) {
      imagemCaminho = `usuarios/fotos/${usuarioId}/` + foto.name;
      if (!fs.existsSync(`usuarios/fotos/${usuarioId}/`)) { fs.mkdirSync(`usuarios/fotos/${usuarioId}`), { recursive: true } };
      fs.readdirSync(`usuarios/fotos/${usuarioId}`).forEach(f => fs.rmSync(`usuarios/fotos/${usuarioId}/${f}`));
      foto.mv(imagemCaminho);
    } else {
      imagemCaminho = 'usuarios/fotos/foto.png';
    }
    conn.query(`UPDATE usu_usuario SET usu_foto = ($1) WHERE usu_id = ${usuarioId}`,
      [imagemCaminho], (error, results) => {
        done();
        return res.status(201).send({
          mensagem: "Foto alterada com sucesso!",
          usuariocriado: {
            usu_id: usuarioId,
            foto: imagemCaminho
          }
        });
      });
  });
}
function isImagem(file) {
  let extensao = file.name.split('.').pop();
  let mimeType = mime.lookup(extensao)
  return mimeType && mimeType.startsWith('image');
}

exports.loginusuarios = (req, res, next) => {
  pg.connect((error, conn,done) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    const { email, senha } = req.body;
    if (!email || !senha) {
      done();
      return res.status(400).send({ mensagem: 'E-mail e senha são obrigatórios' });
    }
    const query = 'SELECT * FROM usu_usuario WHERE usu_email = $1';
    conn.query(query, [email], (error, results) => {
      done();
      if (error) {
        return res.status(500).send({ error: error });
      }
      if (results.rows.length < 1) {
        return res.status(404).send({ mensagem: 'Usuário ou e-mail não encontrado' });
      }
      bcrypt.compare(senha, results.rows[0].usu_senha, (err, result) => {
        if (err) {
          return res.status(401).send({ mensagem: 'Senha incorreta' });
        }
        if (result) {
          const token = jwt.sign({
            usu_id: results.rows[0].usu_id,
            usu_nome: results.rows[0].usu_nome,
            email: results.rows[0].usu_email,
            usu_foto: results.rows[0].usu_foto
          }, process.env.JWT_KEY, {
            algorithm: 'HS512',
            expiresIn: 10800, //10800
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


exports.patchnome = (req, res, next) => {
  pg.connect((error, conn,done) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(`UPDATE usu_usuario SET usu_nome = $1 WHERE usu_id = $2`,
      [req.body.nome, req.body.usu_id],
      (error, resultado, fields) => {
        done();
        if (error) { return res.status(500).send({ error: error }) }
        res.status(202).send({
          mensagem: 'Info editada com sucesso'
        });
      }
    )
  });
};

exports.patchbio = (req, res, next) => {
  pg.connect((error, conn, done) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(`UPDATE usu_usuario SET usu_bio = $1 WHERE usu_id =$2`,
      [req.body.biografia, req.body.usu_id],
      (error, resultado, fields) => {
        done();
        if (error) { return res.status(500).send({ error: error }) }
        res.status(202).send({
          mensagem: 'Info editada com sucesso'
        });
      }
    )
  });
  } 

exports.patchbio = (req, res, next) => {
  pg.connect((error, conn, done) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(`UPDATE usu_usuario SET usu_bio = $1 WHERE usu_id =$2`,
      [req.body.biografia, req.body.usu_id],
      (error, resultado, fields) => {
        done();
        if (error) { return res.status(500).send({ error: error }) }
        res.status(202).send({
          mensagem: 'Info editada com sucesso'
        });
      }
    )
  });
  } 


exports.deleteusuarios = (req, res, next) => {
  pg.connect((error, conn, done) => {
  pg.connect((error, conn, done) => {
    if (error) { return res.status(500).send({ error: error }) }
    conn.query(`DELETE FROM usu_usuario WHERE usu_id = $1`,
      [req.body.usu_id],
      (error, resultado, fields) => {
        done();
        if (error) { return res.status(500).send({ error: error }) }
        res.status(202).send({
          mensagem: 'Usuário deletado'
        });
      }
    )
  });
}
)}


exports.esquecisenha = (req, res, results) => {
  const { email } = req.body;
  pg.connect((error, conn, done) => {
    if (error) { return res.status(500).send({ error: error }) }
    const query = 'SELECT * FROM usu_usuario WHERE usu_email = $1';
    conn.query(query, [req.body.email], (error, results, fields) => {
      done();
      if (error) { return res.status(500).send({ error: error }) };
      if (results.rows.length < 1) {
        return res.status(401).send({ mensagem: 'Usuário ou email não encontrado' });
      };

      let resetToken = jwt.sign({ email }, process.env.JWT_KEY, { expiresIn: '1h' });
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

exports.verificasenha = (req, res) => {
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
  const { senha } = req.body;

  jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    bcrypt.hash(senha, 10, (err, hash) => {
      if (err) {
        return res.status(500).send({ message: 'nova senha', error: err });
      }

      pg.connect((error, conn, done) => {
        if (error) {
          return res.status(500).send({ message: 'Falha na conexão com o banco de dados', error: error });
        }

        conn.query(`UPDATE usu_usuario SET usu_senha = $1 WHERE usu_email = $2`, [hash, decoded.email], (error, results) => {
          done();

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


exports.patchsenha = (req, res, next) => {
  // Recupera a senha atual criptografada do usuário no banco de dados
  const query = 'SELECT usu_senha FROM usu_usuario WHERE usu_id = $1';

  pg.connect((error, conn,done) => {
    if (error) {
      return res.status(500).send({ error: error });
    }

    conn.query(query, [req.user.usu_id], (error, results, fields) => {
      if (error) {
        done();
        return res.status(500).send({ error: error });
      }

      // Verifica se a senha atual fornecida pelo usuário coincide com a senha no banco de dados
      const senhaBanco = results.rows[0].usu_senha; // Assumindo que haja apenas um resultado

      bcrypt.compare(req.body.senha, senhaBanco, (err, result) => {
        if (err || !result) {
          conn.release();
          return res.status(401).send({ mensagem: 'Senha atual incorreta' });
        }

        // Se a senha atual está correta, procede com a atualização da senha
        bcrypt.hash(req.body.novaSenha, 10, (err, hash) => {
          if (err) {
            done();
            return res.status(500).send({ error: err });
          }

          conn.query(
            'UPDATE usu_usuario SET usu_senha = $1 WHERE usu_id = $2',
            [hash, req.user.usu_id],
            (error, resultado, fields) => {
              done();
              if (error) {
                return res.status(500).send({ error: error });
              }

              res.status(202).send({
                mensagem: 'Senha editada com sucesso'
              });
            }
          );
        });
      });
    });
  });
};



exports.seguirusuario = (req, res, next) => {
  const seguidor_id = req.user.usu_id;
  const seguindo_id = req.params.usu_id;
  let seguirNum = 0;

  if (!seguidor_id || !seguindo_id) {
    return res.status(400).send({ error: 'IDs de seguidor e seguido são necessários' });
  }

  pg.connect((error, conn, done) => {
    if (error) {
      return res.status(500).send({ error: error.message });
    }

    // Verificar se a relação já existe
    conn.query(
      'SELECT seg_valor FROM seg_seguir WHERE seg_seguidor = $1 AND seg_seguindo = $2',
      [seguidor_id, seguindo_id],
      (error, result) => {
        if (error) {
          done();
          return res.status(500).send({ error: error.message });
        }

        if (result.rows.length > 0) {
          seguirNum = result.rows[0].seg_valor === 0 ? 1 : 0;
          // Atualizar a relação existente
          conn.query(
            'UPDATE seg_seguir SET seg_valor = $1 WHERE seg_seguidor = $2 AND seg_seguindo = $3',
            [seguirNum, seguidor_id, seguindo_id],
            (error, result) => {
              conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
              
              if (error) {
                done()
                return res.status(500).send({ error: error.message });
              }

              if (seguirNum === 0) {
                conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
                
                if (error) {
                  done();
                  return res.status(500).send({ error: error.message });
                }
                done()
                return res.status(200).send({ mensagem: "Deixou de seguir o usuário com sucesso" });
               
              } else {
                conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
                if (error) {
                  done()
                  return res.status(500).send({ error: error.message });
                }
                done()
                return res.status(201).send({ mensagem: "Usuário seguido com sucesso" });
                
              }
             
            }
            
          );
        } else {
          seguirNum = 1;
          // Inserir nova relação
          conn.query(
            'INSERT INTO seg_seguir (seg_seguidor, seg_seguindo, seg_valor) VALUES ($1, $2, $3)',
            [seguidor_id, seguindo_id, seguirNum],
            (error, result) => {
             
            conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
            done();
              if (error) {
                return res.status(500).send({ error: error.message });
              }

              return res.status(201).send({ mensagem: "Usuário seguido com sucesso" });
            }
          );
        }
      }
    );
  });
};

exports.seguiu = (req, res, next) => {
  const seguidor_id = req.user.usu_id;
  
  pg.connect((error, conn, done) => {
    if (error) {
      done(); // Libera a conexão em caso de erro
      return res.status(500).send({ error: error.message });
    }

    conn.query(
      `SELECT seg_seguindo 
       FROM seg_seguir 
       JOIN usu_usuario u ON u.usu_id = seg_seguindo  
       WHERE seg_seguidor = $1 AND seg_valor > 0`,
      [seguidor_id],
      (error, result) => {
        // Sempre chame done() após completar o processamento da query
        done();
        if (error) {
          done(); // Em caso de erro adicional, garanta a liberação da conexão
          return res.status(500).send({ error: error.message });
        }

        return res.status(200).send({ response: result.rows });
      }
    );
  });
};


exports.segue = (req, res, next) => {
  const seguidor = req.user.usu_id
  const seguindo = req.params.usu_id;
  pg.connect((error, conn, done) => {
    if(error){
      done()
      return res.status(500).send({error:error.message})
    }
    conn.query(
      `SELECT seg_valor 
      FROM seg_seguir 
      WHERE seg_seguidor = $1 
      AND seg_seguindo = $2`,
      [seguidor,seguindo],(error, result)=>{
        if (error){
          done()
          return res.status(500).send({error: error.message});
        }
        done()
        return res.status(200).send({response:result.rows})
      }
    )
  })

}

exports.seguirusuario = (req, res, next) => {
  const seguidor_id = req.user.usu_id;
  const seguindo_id = req.params.usu_id;
  let seguirNum = 0;

  if (!seguidor_id || !seguindo_id) {
    return res.status(400).send({ error: 'IDs de seguidor e seguido são necessários' });
  }

  pg.connect((error, conn, done) => {
    if (error) {
      return res.status(500).send({ error: error.message });
    }

    // Verificar se a relação já existe
    conn.query(
      'SELECT seg_valor FROM seg_seguir WHERE seg_seguidor = $1 AND seg_seguindo = $2',
      [seguidor_id, seguindo_id],
      (error, result) => {
        if (error) {
          done();
          return res.status(500).send({ error: error.message });
        }

        if (result.rows.length > 0) {
          seguirNum = result.rows[0].seg_valor === 0 ? 1 : 0;
          // Atualizar a relação existente
          conn.query(
            'UPDATE seg_seguir SET seg_valor = $1 WHERE seg_seguidor = $2 AND seg_seguindo = $3',
            [seguirNum, seguidor_id, seguindo_id],
            (error, result) => {
              conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
              
              if (error) {
                done()
                return res.status(500).send({ error: error.message });
              }

              if (seguirNum === 0) {
                conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
                
                if (error) {
                  done();
                  return res.status(500).send({ error: error.message });
                }
                done()
                return res.status(200).send({ mensagem: "Deixou de seguir o usuário com sucesso" });
               
              } else {
                conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
                if (error) {
                  done()
                  return res.status(500).send({ error: error.message });
                }
                done()
                return res.status(201).send({ mensagem: "Usuário seguido com sucesso" });
                
              }
             
            }
            
          );
        } else {
          seguirNum = 1;
          // Inserir nova relação
          conn.query(
            'INSERT INTO seg_seguir (seg_seguidor, seg_seguindo, seg_valor) VALUES ($1, $2, $3)',
            [seguidor_id, seguindo_id, seguirNum],
            (error, result) => {
             
            conn.query('update usu_usuario set usu_totalseguidores = ( select coalesce(sum(seg_valor),0) from seg_seguir where seg_seguir.seg_seguindo = usu_usuario.usu_id ) where usu_id in (select usu_id from seg_seguir)')
            done();
              if (error) {
                return res.status(500).send({ error: error.message });
              }

              return res.status(201).send({ mensagem: "Usuário seguido com sucesso" });
            }
          );
        }
      }
    );
  });
};

exports.seguiu = (req, res, next) => {
  const seguidor_id = req.user.usu_id;
  
  pg.connect((error, conn, done) => {
    if (error) {
      done(); // Libera a conexão em caso de erro
      return res.status(500).send({ error: error.message });
    }

    conn.query(
      `SELECT seg_seguindo 
       FROM seg_seguir 
       JOIN usu_usuario u ON u.usu_id = seg_seguindo  
       WHERE seg_seguidor = $1 AND seg_valor > 0`,
      [seguidor_id],
      (error, result) => {
        // Sempre chame done() após completar o processamento da query
        done();
        if (error) {
          done(); // Em caso de erro adicional, garanta a liberação da conexão
          return res.status(500).send({ error: error.message });
        }

        return res.status(200).send({ response: result.rows });
      }
    );
  });
};


exports.segue = (req, res, next) => {
  const seguidor = req.user.usu_id
  const seguindo = req.params.usu_id;
  pg.connect((error, conn, done) => {
    if(error){
      done()
      return res.status(500).send({error:error.message})
    }
    conn.query(
      `SELECT seg_valor 
      FROM seg_seguir 
      WHERE seg_seguidor = $1 
      AND seg_seguindo = $2`,
      [seguidor,seguindo],(error, result)=>{
        if (error){
          done()
          return res.status(500).send({error: error.message});
        }
        done()
        return res.status(200).send({response:result.rows})
      }
    )
  })
}
