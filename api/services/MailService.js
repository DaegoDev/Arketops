module.exports = {
  /**
   * Función para enviar cotización.
   * @param  {String} valor Dato que se desea cifrar.
   * @return {String}       Retorna el dato cifrado.
   */
  sendTest: function(correo) {
    sails.hooks.email.send("test", {
      msg: "Prueba de email"
    }, {
      to: correo,
      subject: "test Arketops"
    }, function(err) {
      sails.log.debug(err);
    })
  },

  sendMailSignup: function(correo, nameCompany) {
    sails.hooks.email.send("signup", {
      title: "Bienvenido a la plataforma Arketops",
      user: nameCompany
    }, {
      to: correo,
      subject: "Plataforma_Arketops"
    }, function(err) {
      sails.log.debug(err);
    })
  },

  sendMailCode: function(user, code) {
    sails.hooks.email.send("token", {
        code: code
      }, {
        to: user.email,
        subject: "Recuperación contraseña ARKETOPS"
      },
      function(err) {});
  },
  /**
  * Función para enviar un correo con la nueva contraseña a la empresa que solicitó
  * recuperar la contraseña.
  * @param  {Object} usuario dato que contiene el correo al que se enviara contraseña.
  * @param  {String} tipo describe el tipo de usuario que desea recuperar contraseña.
  * @return {bool}        Retorna true si se envio el correo correctamente,
  *                               retorna falso de lo contrario.
  */
  sendMailPassword: function (email, password) {
    sails.hooks.email.send("password", {password: password},
    {to: email,
    subject: "Recuperación contraseña ARKETOPS"},
    function(err) {
    });
  }
}
