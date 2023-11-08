//const path = require('path');
const nodemailer = require('nodemailer');
//const hbs = require('nodemailer-express-handlebars');

var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: "gustavotet2022@outlook.com.br",
      pass: "yZ*V2Y9%2i5A%B3c4"
    }
  });

module.exports = transporter;
