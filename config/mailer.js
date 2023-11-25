const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: "indieshowcase@outlook.com.br",
      pass: "indiesenha123"
    }
  });

module.exports = transporter;
