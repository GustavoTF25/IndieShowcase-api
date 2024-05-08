const pg = require ('pg');
require('dotenv').config();


const pool = new pg.Pool({
    user: process.env.PG_USER ,
    password: process.env.PG_PASSWORD,
    database:process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    

});
console.log( pool.query('SELECT NOW()'))
exports.pool = pool;