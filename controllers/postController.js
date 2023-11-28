const mysql = require('../mysql').pool;
const fs = require('fs');
const mime =require('mime-types');

exports.getallposts = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        'SELECT * FROM pos_postagem',
        (error, resultado, fields) => {
            if(error) { return res.status(500).send({error: error})}
            return res.status(200).send({response: resultado});
        }
      );
    });
};
// esse aqui do adm
exports.delPostagem = ( req, res, next ) => {
    mysql.getConnection((error, conn) => {
        if(error){return res.status(500).send({error:error})}
        conn.query(`DELETE FROM pos_postagem WHERE pos_id = ${req.params.pos_id}`,(error, results) => {
            conn.release();
            if(error){return res.status(500).send({message:"Postagem nao encontrada"})}
            res.status(200).send({response: results})
        })
    })
}

exports.delPostagemUser = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }); }
        conn.query(`SELECT pos_id, usu_id FROM pos_postagem WHERE pos_id = ${req.params.pos_id}`, (error, results) => {
            conn.release();
            if (error) {  return res.status(500).send({ error: error }); }
            if (results.length === 0) {
                return res.status(404).send({ message: "Postagem não encontrada" });
            }
            const postagemUsuarioId = results[0].usu_id;
            if (req.user.usu_id !== postagemUsuarioId) {
                return res.status(403).send({ message: "Você não tem permissão para apagar esta postagem" });
            }
            conn.query(`DELETE FROM arq_arquivos WHERE pos_id = ${req.params.pos_id}`, (error, results) => { } )
            conn.release();
                conn.query(`DELETE FROM pos_postagem WHERE pos_id = ${req.params.pos_id} AND usu_id = ${req.user.usu_id}`, (error, results) => {
                    conn.release();
                        if (error) { return res.status(500).send({ error: error }); }
                            conn.query(`DELETE FROM arq_arquivos WHERE pos_id = ${req.params.pos_id}`, (error, results) => { } )
                                conn.release();
                                    if (error) { return res.status(500).send({ error: error }); }
                                    conn.query(`DELETE FROM gos_gostei WHERE pos_id = ${req.params.pos_id}`, (error, results) => {
                                        conn.release();
                                        fs.readdirSync(`postagens/${req.params.pos_id}/`).forEach(f => fs.rmSync(`postagens/${req.params.pos_id}/${f}`));
                                            fs.rmdirSync(`postagens/${req.params.pos_id}`);
                        if (error) { return res.status(500).send({ error: error }); }
                    res.status(200).send({ response: "Sua postagem foi apagada" });
                });
            });
        });
    });
};

exports.getpoststitulo = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        `Select * FROM pos_postagem where pos_nome LIKE '%${req.params.titulo}%'`,
        (error, resultado, fields) => {
        if(error) {return res.status(500).send({error:error})};
        return res.status(200).send({response: resultado});
    }
    );
});
}

exports.getpostsid = (req, res) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        `Select * FROM pos_postagem where pos_id = ?`,
        [req.params.pos_id],
        (error, resultado, fields) => {
        if(error) {return res.status(500).send({error:error})};
        return res.status(200).send({response: resultado});
    }
    );
});
}
 

exports.postpostagem = (req, res, next)  => {
    mysql.getConnection((error, conn) => 
    {  
        if(error) {return res.status(401).send({error:error, mensagem:"Erro na capa"})}
        if(error){return res.status(500).send({error: mysql, mensagem: "erro ao inserir no banco"})} 
        const usuarioId = req.user.usu_id;
        const arquivos = req.files;
        const { titulo, descricao, tags, cat_id } = req.body;
        if (!arquivos || Object.keys(arquivos).length === 0) { 
            return res.status(400).send({ mensagem: "Nenhum arquivo enviado" });
        }
        conn.query('INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) VALUES (?,?,?,?,?)', 
        [req.body.titulo, req.body.descricao, req.body.tags, usuarioId, req.body.cat_id], 
        (error,results) => {
            conn.release();    
            const postagemId = results.insertId;
            const { capa } = req.files;
            let caminhoCapa = '';
            if(!capa){
                caminhoCapa = `postagens/foto.png`;
            }else{
                if(!isImagem(capa)){return res.status(400).send({mensagem: "Esse arquivo deve uma imagem"})} 
                caminhoCapa = `postagens/${postagemId}/` + capa.name;
            }
            conn.query(`UPDATE pos_postagem SET pos_capa = ? WHERE pos_id = ${postagemId}`, [caminhoCapa])
            const inserirArquivo = (arquivo) => {
                if (arquivo) {
                    const caminhoArquivo = `postagens/${postagemId}/` + arquivo.name;
                    if (!fs.existsSync(`postagens/${postagemId}/`)) {fs.mkdirSync(`postagens/${postagemId}`, { recursive: true });}
                    arquivo.mv(caminhoArquivo, (err) => {
                        if (err) {return res.status(500).send({ error: err, message: "Falha no envio do arquivo" });}
                        conn.query('INSERT INTO arq_arquivos (arq_nome, arq_extensao, pos_id) VALUES (?,?,?)',
                        [arquivo.name, arquivo.mimetype, postagemId],
                        (error) => {if (error) {return res.status(500).send({ error: error, message: "Falha no envio do arquivo no servidor" });}}
                        );
                    });
                }
            };
            Object.values(arquivos).forEach(inserirArquivo);

            const response = {
                mensagem: "Postagem criada!",
                postagemcriada: {
                    pos_id: postagemId,
                    titulo: titulo,
                    descricao: descricao,
                    tags: tags,
                    usu_id: usuarioId,
                    cat_id: cat_id,
                    capa: caminhoCapa,
                    capa: caminhoCapa,
                    arquivos: Object.values(arquivos).map((arquivo) => arquivo.name),
                },
            };
            return res.status(201).send(response);
        });              
    });
 }
function isImagem(file){
    let extensao = file.name.split('.').pop();
    let mimeType = mime.lookup(extensao)
    return mimeType && mimeType.startsWith('image');
}

exports.getComentarios = (req, res) => {
            mysql.getConnection((error, conn) => {
                if(error) {return res.status(500).send({error:error})};
                conn.query(
                'SELECT * FROM com_comentarios',
                (error, resultado, fields) => {
                    if(error) { return res.status(500).send({error: error})}
                    return res.status(200).send({response: resultado});
                }
              );
            });
        }


   exports.postComentario = (req, res) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})}
                if(error){return res.status(500).send({error: mysql})}
                conn.query('INSERT INTO com_comentarios (usu_id, com_texto, pos_id) VALUES (?,?,?)',
                [req.user.usu_id, req.body.texto, req.params.pos_id],
                (error) => {
                    conn.release();
                    if(error) {return res.status(500).send({error:error})}
                    response = {
                        mensagem: "Comentário feito",
                        postagemcriada: {
                            usu_id: req.user.usu_id,
                            pos_id: req.params.pos_id,
                            texto : req.body.texto
                        }
                    }
                    return res.status(201).send(response);
                });
            });
        }

        exports.postGostei = (req, res) => {
            let gostei = 0;
            mysql.getConnection((error, conn) => {
                if (error) {return res.status(500).send({ error: error });}
                // Verificar se o usuário já curtiu a postagem
                conn.query('SELECT usu_id, pos_id, gos_valor FROM gos_gostei WHERE usu_id = ? AND pos_id = ?', [req.user.usu_id, req.params.pos_id], (error, results) => {
                    if (error) { conn.release();
                        return res.status(500).send({ error: error });
                    }
                    // Se o usuário já curtiu, remova o gostei
                    if (results.length > 0) {
                        gostei = results[0].gos_valor === 0 ? 1 : 0;
                        conn.query('UPDATE gos_gostei SET gos_valor = ? WHERE usu_id = ? AND pos_id = ?', [gostei, req.user.usu_id, req.params.pos_id], (error, results) => {
                            conn.release();
                            conn.query('update pos_postagem set pos_qtdgostei = (select coalesce(sum(gos_valor),0) from gos_gostei where pos_postagem.pos_id = gos_gostei.pos_id ) where pos_id in (select pos_id from gos_gostei);')
                            if (error) {return res.status(500).send({ error: error });}
                            conn.release()
                            if (gostei === 0) {
                                return res.status(201).send({ mensagem: "Gostei removido com sucesso" });
                            } else {
                                return res.status(201).send({ mensagem: "Gostei adicionado com sucesso" });
                            }
                        });
                    } else {
                        // Se o usuário ainda não curtiu, adicione o gostei
                        gostei = 1;
                        conn.query('INSERT INTO gos_gostei (usu_id, pos_id, gos_valor) VALUES (?, ?, ?)', [req.user.usu_id, req.params.pos_id, gostei], (error, results) => {
                            conn.release();
                            if (error) {
                                return res.status(500).send({ error: error });
                            }
                            return res.status(200).send({ mensagem: "Gostei adicionado com sucesso" });
                        });
                    }
                });
            });
        };
        exports.getComentariospost = (req, res) => {
            if (!req.params.pos_id) {
                return res.status(400).send({ error: 'Parâmetro de id de postagem ausente' });
            }   
            mysql.getConnection((error, conn) => {
                if(error) {return res.status(500).send({error:error})};
                conn.query(
                `Select * FROM com_comentarios where pos_id LIKE '%${req.params.pos_id}%'`,
                (error, resultado, fields) => {
                conn.release();
                if(error) {return res.status(500).send({error:error})};
                return res.status(200).send({response: resultado});
            }
            );
        });
         }
        

exports.getcategoriaspost = (req, res) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error:error})};
        conn.query(
        `Select * FROM pos_postagem where cat_id LIKE '%${req.params.cat_id}%'`,
        (error, resultado, fields) => {
        if(error) {return res.status(500).send({error:error})};
        return res.status(200).send({response: resultado});
    }
    );
});
 }
