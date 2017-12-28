module.exports = {
  /**
   * Función test.
   * @param  {String} correo correo al que se envia el test.
   * @return
   */
  sendTest: function(correo) {
    sails.hooks.email.send("test", {
      msg: "Prueba de email"
    }, {
      to: correo,
      subject: "test Arketops"
    }, function(err, info) {
      sails.log.debug(err || info);
    })
  },

  /**
   * Función para enviar correo despues del registro.
   * @param  {String} correo correo al que se envia el mensaje de bienvenida.
   * @param  {String} nameCompany nombre de la empresa registrada.
   * @return
   */
  sendMailSignup: function(correo, nameCompany) {
    sails.hooks.email.send("signup", {
      title: "Bienvenido a la plataforma Arketops",
      user: nameCompany
    }, {
      to: correo,
      subject: "Plataforma_Arketops"
    }, function(err, info) {
      sails.log.debug(err || info);
    })
  },

  /**
   * Función para enviar el código para recuperar la contraseña.
   * @param  {Object} user Objeto con los datos del usuario.
   * @param  {String} code Código que se enviará al correo del usuario.
   * @return
   */
  sendMailCode: function(user, code) {
    sails.hooks.email.send("token", {
        code: code
      }, {
        to: user.email,
        subject: "Recuperación contraseña ARKETOPS"
      },
      function(err, info) {
        sails.log.debug(err || info);
      });
  },
  /**
   * Función para enviar un correo con la nueva contraseña a la empresa que solicitó
   * recuperar la contraseña.
   * @param  {String} email dato que contiene el correo al que se enviara contraseña.
   * @param  {String} password nueva contraseña que se envia al correo.
   * @return
   */
  sendMailPassword: function(email, password) {
    sails.hooks.email.send("password", {
        password: password
      }, {
        to: email,
        subject: "Recuperación contraseña ARKETOPS"
      },
      function(err, info) {
        sails.log.debug(err || info);
      });
  },

  /**
   * Función para enviar un correo con la cotización generada para el cliente.
   * @param  {Object} supplier datos del proveedor.
   * @param  {Object} client datos del cliente.
   * @param  {String} pathFile ruta de la cotización generada.
   * @return
   */
  sendQuotationToClient: function(supplier, client, pathFile) {
    sails.hooks.email.send("quotationToClient", {
      supplierName: supplier.name,
      supplierNIT: supplier.nit,
      supplierEmail: supplier.User.email
    }, {
      to: client.User.email,
      subject: "Cotización generada ARKETOPS",
      attachments: [{
        path: pathFile
      }]
    },function (err, info) {
      sails.log.debug(err || info);
    })
  },

  /**
   * Función para enviar un correo con la cotización generada al proveedor.
   * @param  {Object} supplier datos del proveedor.
   * @param  {Object} client datos del cliente.
   * @param  {String} pathFile ruta de la cotización generada.
   * @return
   */
  sendQuotationToSupplier: function(supplier, client, pathFile) {
    sails.hooks.email.send("quotationToSupplier", {
      clientName: client.name,
      clientNIT: client.nit,
      clientEmail: client.User.email
    }, {
      to: supplier.User.email,
      subject: "Cotización generada ARKETOPS",
      attachments: [{
        path: pathFile
      }]
    },function (err, info) {
      sails.log.debug(err || info);
    })
  }
}
