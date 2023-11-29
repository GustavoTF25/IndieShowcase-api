const jwt = require('jsonwebtoken');
const segredo = process.env.JWT_KEY;

exports.decodifica = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, segredo, { algorithms: ['HS512', 'HS256'] })
        req.user = {
            usu_id: decoded.usu_id,
            email: decoded.usu_email,
            foto: decoded.usu_foto
        }
        next();
    } catch (error) {
        res.status(401).send({ mensagem: 'Token Inválido ou expirado' });
        next();
    }


}


