const pg = require('../pg').pool;

exports.getcategorias = (req, res, next) => {
    pg.connect((error, conn,close) => {
        if (error) { return res.status(500).send({ error: error }) };
        conn.query(
            'SELECT * FROM cat_categoria',
            (error, resultado, fields) => {
                close();
                if (error) { return res.status(500).send({ error: error }) }
                return res.status(200).send({ response: resultado.rows });
            }
        );
    });

};

exports.postcategorias = (req, res, next) => {
    pg.connect((error, conn, close) => {
        if (error) { return res.status(500).send({ error: error }) }
        // se ja houver uma categoria
        conn.query('SELECT * FROM cat_categoria WHERE cat_id = $1', [req.body.cat_id], (error, results) => {
            if (error) { return res.status(500).send({ error: error }) }
            if (results.rows.length > 0) {
                res.status(409).send({ mensagem: 'Categoria ja criada anteriormente' });
            } else {
                if (error) { return res.status(500).send({ error: pg }) }
                conn.query('INSERT INTO cat_categoria ( cat_nome) VALUES ($1)',
                    [req.body.nome],
                    (error, results) => {
                        close();
                        if (error) { return res.status(500).send({ error: error }) }
                        response = {
                            mensagem: "Categoria criada!",
                            categoriaCriado: {
                                cat_id: results.rows[0].cat_id,
                                nome: req.body.nome,

                            }
                        }
                        return res.status(201).send(response);
                    });
                //console.log(results.insertId , req.body.nome);
            }
        });

    });
};