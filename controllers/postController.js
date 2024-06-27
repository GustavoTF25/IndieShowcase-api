const pg = require('../pg').pool;
const { doesNotMatch } = require('assert');
const fs = require('fs');
const mime = require('mime-types');



exports.getallposts = (req, res, next) => {
    pg.connect((error, conn,done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM pos_postagem',
            (error, resultado, fields) => {
                done();
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: resultado.rows });
            }
        );
    });
};

exports.getpoststitulo = (req, res, next) => {
    pg.connect((error, conn,done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `Select * FROM pos_postagem where pos_nome ILIKE '%${req.params.titulo}%'`,
            (error, resultado, fields) => {
                done();
                if (error) { return res.status(500).send({ error: error }) };
                return res.status(200).send({ response: resultado.rows });
            }
        );
    });
}

exports.getpostsid = (req, res) => {
    pg.connect((error, conn,done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'Select * FROM pos_postagem where pos_id = $1',
            [req.params.pos_id],
            (error, resultado, fields) => {
                done();
                if (error) { return res.status(500).send({ error: error }) };
                return res.status(200).send({ response: resultado.rows });
            }
        );
    });
}
 
// No controlador:
exports.getusuariopostagensperfil = ( req, res, next) =>{
    const usu_id = req.user.usu_id;
    pg.connect((error, conn, done) => {
        if (error){return res.status(500).send({ error : error }) };
        conn.query(
            `Select * From pos_postagem where usu_id = ${usu_id} ORDER BY pos_data DESC`,(error,resultado,fields) => {
                done();
                if  ( error ) { return res.status(500).send({error:error})}
                // console.log("esta no detalhe")
                return res.status(200).send({ response: resultado.rows})
            }
        )
    })
}

 
exports.getusuariopostagens = ( req, res, next) =>{
    pg.connect((error, conn, done) => {
        if (error){return res.status(500).send({ error : error }) };
        conn.query(
            `Select * From pos_postagem where usu_id = ${req.params.usu_id} ORDER BY pos_data DESC`,(error,resultado,fields) => {
                done();
                if  ( error ) { return res.status(500).send({error:error})}
                // console.log("esta no detalhe")
                return res.status(200).send({ response: resultado.rows})
            }
        )
    })
}

exports.postpostagem = (req, res, next) => {
    if (!req.user || !req.user.usu_id) {
        return res.status(500).send({ message: "Não logado" });
    }

    pg.connect((error, conn, done) => {
        if (error) {
            done();
            return res.status(500).send({ message: "Falha na conexão com o banco de dados", error });
        }

        const usuarioId = req.user.usu_id;
        const { arquivos, capa } = req.files || {};
        const { titulo, descricao, tags, cat_id } = req.body;

        // Verifica se não há arquivo e não há capa
        if (!arquivos && !capa) {
            done();
            return res.status(400).send({ mensagem: "Nenhum arquivo ou capa enviados" });
        }
        if (!arquivos && capa) {
            done();
            return res.status(400).send({ mensagem: "Nenhum arquivo ou capa enviados" });
        }

        const queryText = `INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) 
                           VALUES ($1, $2, $3, $4, $5) RETURNING pos_id`;

        conn.query(queryText, [titulo, descricao, tags, usuarioId, cat_id], (error, results) => {
            if (error) {
                done();
                return res.status(500).send({ message: "Falha ao criar a postagem", error });
            }

            const postagemId = results.rows[0].pos_id;
            let caminhoCapa = 'postagens/template.png';

            // Processa a capa se houver
            if (capa) {
                if (!isImagem(capa)) {
                    done();
                    return res.status(400).send({ mensagem: "A capa deve ser uma imagem" });
                }

                caminhoCapa = `postagens/${postagemId}/${capa.name}`;
                if (!fs.existsSync(`postagens/${postagemId}/`)) {
                    fs.mkdirSync(`postagens/${postagemId}`, { recursive: true });
                }

                capa.mv(caminhoCapa, (err) => {
                    if (err) {
                        done();
                        return res.status(500).send({ message: "Falha no envio da capa", error: err });
                    }

                    conn.query(`UPDATE pos_postagem SET pos_capa = $1 WHERE pos_id = $2`, [caminhoCapa, postagemId], (error) => {
                        if (error) {
                            done();
                            return res.status(500).send({ message: "Falha ao atualizar o caminho da capa no banco de dados", error });
                        }
                    });
                });
            }else{
                caminhoCapa = 'postagens/template.png';
                if (!fs.existsSync(`postagens/${postagemId}/`)) {
                    fs.mkdirSync(`postagens/${postagemId}`, { recursive: true });
                }
                    conn.query(`UPDATE pos_postagem SET pos_capa = $1 WHERE pos_id = $2`, [caminhoCapa, postagemId], (error) => {
                        if (error) {
                            done();
                            return res.status(500).send({ message: "Falha ao atualizar o caminho da capa no banco de dados", error });
                        }
                    
                });
            }

            // Processa o arquivo se houver
            if (arquivos) {
                const caminhoArquivo = `postagens/${postagemId}/${arquivos.name}`;
                if (!fs.existsSync(`postagens/${postagemId}/`)) {
                    fs.mkdirSync(`postagens/${postagemId}`, { recursive: true });
                }

                arquivos.mv(caminhoArquivo, (err) => {
                    if (err) {
                        done();
                        return res.status(500).send({ message: "Falha no envio do arquivo", error: err });
                    }

                    conn.query(
                        'INSERT INTO arq_arquivos (arq_nome, arq_extensao, pos_id, arq_caminho) VALUES ($1, $2, $3, $4)',
                        [arquivos.name, arquivos.mimetype, postagemId, caminhoArquivo],
                        (error) => {
                            if (error) {
                                done();
                                return res.status(500).send({ message: "Falha ao salvar o arquivo no banco de dados", error });
                            }
                        }
                    );
                });
            }

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
                    arquivos: arquivos ? arquivos.name : null
                }
            };

            done();
            return res.status(201).send(response);
        });
    });
};

function isImagem(file) {
    const extensao = file.name.split('.').pop();
    const mimeType = mime.lookup(extensao);
    return mimeType && mimeType.startsWith('image');
}

/*exports.postpostagem = (req, res, next) => {
    if(!req.user.usu_id){ 
        return res.status(500).send({message:"não logado"})
    }else{   
    pg.connect((error, conn,done) => {
        const usuarioId = req.user.usu_id;
        const { arquivos, capa } = req.files || {};
        //const { arquivos }  = req.files;
        const { titulo, descricao, tags, cat_id } = req.body;  
        if (!arquivos && !capa) {
            console.log(arquivos, capa)
            done();
            return res.status(400).send({ mensagem: "Nenhum arquivo ou capa enviados" });
        }


    
        conn.query(`INSERT INTO pos_postagem (pos_nome, pos_descricao, pos_tags, usu_id, cat_id) VALUES ('${req.body.titulo}',' ${req.body.descricao} ','${req.body.tags}',' ${usuarioId}', '${req.body.cat_id}' ) RETURNING pos_id` ,
            (error, results) => {
                const postagemId = results.rows[0].pos_id;
                //const { capa } = req.files;
                let caminhoCapa = '';
                if (!capa) {
                    caminhoCapa = `postagens/template.png`;
                } else {
                    if (!isImagem(capa)) { return res.status(400).send({ mensagem: "Esse arquivo deve uma imagem" }) }
                    caminhoCapa = `postagens/${postagemId}/` + capa.name;
                    if(!fs.existsSync(`postagens/${postagemId}/`)){fs.mkdirSync(`postagens/${postagemId}` , {recursive: true}); }
                    capa.mv(caminhoCapa, (err) => {
                        if (err) { return res.status(500).send({ error: err, message: "Falha no envio da capa" }); }
                        conn.query(`UPDATE pos_postagem SET pos_capa='${caminhoCapa}' WHERE pos_id = ${postagemId}`)
                    //done();
                    })
                }
                if (arquivos) {
                    const caminhoArquivo = `postagens/${postagemId}/` + arquivos.name;
                    if (!fs.existsSync(`postagens/${postagemId}/`)) { fs.mkdirSync(`postagens/${postagemId}`, { recursive: true }); }
                    arquivos.mv(caminhoArquivo);
                conn.query('INSERT INTO arq_arquivos (arq_nome, arq_extensao, pos_id,arq_caminho) VALUES ($1, $2, $3, $4)',
                [arquivos.name, arquivos.mimetype, postagemId,caminhoArquivo],
                (error, results) => { 
                    //done();
                    if (error) { 
                    done();
                    return res.status(500).send({ error: error, message: "Falha no envio do arquivo no servidor" });
                        }
                    }
                );
                }else{
                    done();
                    console.error("erro no arquivo")
                }
           
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
                        arquivos: arquivos.name
                    },
                };
                     done();
                return res.status(201).send(response);
            });
    });
}
} 
function isImagem(file) {
    let extensao = file.name.split('.').pop();
    let mimeType = mime.lookup(extensao)
    return mimeType && mimeType.startsWith('image');
}*/

exports.getComentarios = (req, res) => {
    pg.connect((error, conn,done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM com_comentarios',
            (error, resultado, fields) => {
                done();
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: resultado.rows });
            }
        );
    });
}


exports.postComentario = (req, res) => {
    pg.connect((error, conn,done) => {
        if (error) { return res.status(500).send({ error: error }) }
        if (error) { return res.status(500).send({ error: pg }) }
        conn.query(`INSERT INTO com_comentarios (usu_id, com_texto, pos_id) VALUES ($1,$2 ,$3)`,
            [req.user.usu_id, req.body.com_texto, req.params.pos_id],
            (error) => {
                if (error) { return res.status(500).send({ error: error }) }
                response = {
                    mensagem: "Comentário feito",
                    postagemcriada: {
                        usu_id: req.user.usu_id,
                        pos_id: req.params.pos_id,
                        com_texto: req.body.com_texto,
                    }
                }
                done();
                return res.status(201).send(response);
            });
    });
}

exports.postGostei = (req, res) => {
    let gostei = 0;
    pg.connect((error, conn, done) => {
        if (error) { return res.status(500).send({ error: error }); }
        conn.query('SELECT usu_id, pos_id, gos_valor FROM gos_gostei WHERE usu_id = $1 AND pos_id = $2', [req.user.usu_id, req.params.pos_id], (error, results) => {

            if (error) {
                done();
                return res.status(500).send({ error: error });
            }
            if (results.rows.length > 0) {
                gostei = results.rows[0].gos_valor === 0 ? 1 : 0;
                conn.query('UPDATE gos_gostei SET gos_valor = $1 WHERE usu_id = $2 AND pos_id = $3', [gostei, req.user.usu_id, req.params.pos_id], (error, results) => {
                    conn.query('update pos_postagem set pos_qtdgostei = ( select coalesce(sum(gos_valor),0) from gos_gostei where pos_postagem.pos_id = gos_gostei.pos_id ) where pos_id in (select pos_id from gos_gostei)')
                    //done();
                    if (error) { return res.status(500).send({ error: error }); }
                    if (gostei === 0) {
                        done();
                        return res.status(200).send({ mensagem: "Gostei removido com sucesso" });
                    } else {
                        done();
                        return res.status(201).send({ mensagem: "Gostei adicionado com sucesso" });
                    }
                });
            } else {
                gostei = 1;
                conn.query('INSERT INTO gos_gostei (usu_id, pos_id, gos_valor) VALUES ($1, $2, $3)', [req.user.usu_id, req.params.pos_id, gostei], (error, results) => {
                    conn.query('update pos_postagem set pos_qtdgostei = ( select coalesce(sum(gos_valor),0) from gos_gostei where pos_postagem.pos_id = gos_gostei.pos_id ) where pos_id in (select pos_id from gos_gostei)')
                    if (error) {
                        return res.status(500).send({ error: error });
                    }
                    done();
                    return res.status(201).send({ mensagem: "Gostei adicionado com sucesso" });
                });
            }
        });
    });
};



exports.getComentariospost = (req, res) => {
    if (!req.params.pos_id) {
        return res.status(400).send({ error: 'Parâmetro de id de postagem ausente' });
    }
    pg.connect((error, conn,done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `Select * FROM com_comentarios where pos_id = '${req.params.pos_id}'`,
            (error, resultado, fields) => {
                done();
                if (error) { return res.status(500).send({ error: error }) };
                return res.status(200).send({
                    response: resultado.rows
                });
            }
        );
    });
}
exports.getcategoriaspost = (req, res) => {
    if (!req.params.cat_id) {
        return res.status(400).send({ error: 'Parâmetro de id de categoria ausente' });
    }
    pg.connect((error, conn, done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `Select * FROM pos_postagem pos join cat_categoria cat on pos.cat_id = cat.cat_id where pos.cat_id = ${req.params.cat_id}`,
            (error, resultado, fields) => {
                done();
                if (error) { return res.status(500).send({ error: error }) };
                return res.status(200).send({ response: resultado.rows });
            }
        );
    });
}

exports.getcategoriasnomepost = (req, res) => {
    if (!req.params.cat_nome) {
        return res.status(400).send({ error: 'Parâmetro nome de categoria ausente' });
    }
    pg.connect((error, conn,done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `Select * FROM cat_categoria where cat_nome LIKE '%${req.params.cat_nome}%'`,
            (error, resultado, fields) => {
                 
                if (error) { return res.status(500).send({ error: error }) };
                done();
                return res.status(200).send({ response: resultado.rows });
                
            }
        );
    });
}

exports.patchpostagem = (req, res, next) => {
    pg.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(`UPDATE pos_postagem SET pos_nome = ? WHERE pos_id =?`,
            [req.body.nome, req.params.pos_id],
            (error, resultado, fields) => {
                conn.release();
                if (error) { return res.status(500).send({ error: error }) }
                res.status(202).send({
                    mensagem: 'Postagem Editada'
                });
            }
        )
    });
};

exports.delPostagem = (req, res, next) => {
    pg.getConnection((error, conn) => {
        if (error) { return res.status(500).send({ error: error }) }
        conn.query(`DELETE FROM pos_postagem WHERE pos_id = ${req.params.pos_id}`, (error, results) => {
            conn.release();
            if (error) { return res.status(500).send({ message: "Postagem nao encontrada" }) }
            res.status(200).send({ response: results })
        })
    })
}
exports.download = (req, res) => {
    pg.connect((error, conn, done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(`Select arq_nome, arq_extensao From arq_arquivos WHERE pos_id = ${req.params.pos_id} `, (error, results) => {
            
            if (error) {
                done();
                return res.status(409).send({ error: "erro no banco" }) 
            }
            if (results < 1) {
                done();
                return res.status(404).send({ response: "arquivo ou diretório inexistente" }) 
                }
            const caminho = `postagens/${req.params.pos_id}/${results.rows[0].arq_nome}`;
            res.header('Content-Disposition', `attachment; filename=${results.rows[0].arq_nome}.${results.rows[0].arq_extensao}`);
            res.download(caminho);
            done();
        });
    })
}

exports.getarquivo = (req, res) => {
    if (!req.params.pos_id) {
        return res.status(400).send({ error: 'Parâmetro de id de postagem ausente' });
    }
    pg.connect((error, conn, done) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            `Select * FROM arq_arquivos where pos_id = ${req.params.pos_id}`,
            (error, resultado, fields) => {
               
                if (error) { return res.status(500).send({ error: error }) };
                 done();
                return res.status(200).send({
                    response: resultado.rows
                });
            }
        );
    });

}
