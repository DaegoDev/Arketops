
// var wellknown = require('nodemailer-wellknown');
//
// var config = wellknown('Gmail');
// config.auth = {
//   user: 'arketops1@gmail.com',
//   pass: 'arketops123'
// }
var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     host: 'mail.arketops.com',
//     port: '465',
//     secure: true, // use TLS
    // auth: {
    //     user: 'app@arketops.com',
    //     pass: 'app$2016'
    // },
//     requireTLS: false,
//     logger: true,
//     debug: true,
//     tls: {
//         rejectUnauthorized: false
//     }
// });

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: '465',
    secure: true, // use TLS
    // service: 'Gmail',
    auth: {
        user: 'arketops1@gmail.com',
        pass: 'arketops123'
    },
    requireTLS: false,
    logger: true,
    debug: true,
    tls: {
        rejectUnauthorized: false
    }
});

// var transporter = nodemailer.createTransport({
//     sendmail: true,
//     newline: 'unix',
//     path: '/usr/sbin/sendmail'
// });

// var transporter = nodemailer.createTransport('smtps://app@arketops.com:app$2016@smtp.arketops.com')

// verify connection configuration
transporter.verify(function(error, success) {
   if (error) {
        sails.log.error(error);
   } else {
        sails.log.debug('Server is ready to take our messages');
   }
});

module.exports.email = {
  transporter: transporter,
  // service: 'Gmail',
  // auth: {
  //     user: 'arketops1@gmail.com',
  //     pass: 'arketops123'
  // },
  // service:'Webmail',
  // auth: {
  //     user: 'app@arketops.com',
  //     pass: 'app$2016'
  // },
  templateDir: "api/emailTemplates",
  // from: "app@arketops.com",
  from: 'arketops1@gmail.com',
  // from: 'jonnatan@jonnatan-x441uv',
  testMode: false,
};



// var generator = require('xoauth2').createXOAuth2Generator({
//     user: 'arketops1@gmail.com',
//     clientId: '239256089184-vac8fmu9is2sog4rs9kj4ujo06cpjts1.apps.googleusercontent.com',
//     clientSecret: '6mL7401HElGwJZmlXfj_xjJA',
//     refreshToken: '1/pVY9lCvKY4E-NVqhWs02VCSzPcY4hqQK0B7cogRcr0dtQLmopQ5ibFzXKG1A6ePZ',
//     accessToken: 'ya29.GlucBH9-AXLAqP055Na4Uvqe1vr3oqMlDuKwgCGDWl-tdDYFkhSHPIAsedSRht2A0yUXT9Jv4dn3c_ZFjxvQ64hUxbXYswIiukpVKrcSni3HQO0FVHt6cSX8EpZF' // optional
// });
// module.exports.email = {
// 	 service: "Gmail",
// 	 auth: {
// 		 xoauth2:generator
// 	 },
//    secure: false,
//    requireTLS: true,
//    tls: {
//         rejectUnauthorized: false
//     },
// 	 templateDir: "api/emailTemplates",
// 	 from: "arketops1@gmail.com",
// 	 testMode: false,
// 	 // ssl: true
//
// };
