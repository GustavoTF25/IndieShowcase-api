const jwt = require('jsonwebtoken');
const segredo = process.env.JWT_KEY;

exports.opcional = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, segredo, { algorithms: ['HS512'] });
        req.user = {
            usu_id: decoded.usu_id
        };
        next();
    } catch (error) {
    console.log(error)
        next();
    }
    
  
}


