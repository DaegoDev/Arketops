
module.exports = {
  /**
  * Función para enviar cotización.
  * @param  {String} valor Dato que se desea cifrar.
  * @return {String}       Retorna el dato cifrado.
  */
  sendTest: function (correo) {
    sails.hooks.email.send("test",{msg: "Prueba de email"}, {to: correo, subject: "test Arketops"}, function (err) {
      sails.log.debug(err);
    })
  }
}
