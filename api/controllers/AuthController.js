/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 /**
  *  Librerias utilizadas para la autenticación y autorización.
  */
 var passport = require('passport');
 /**
  * Callback ejecutato para la autenticación de un usuario.
  * @param  {Object} req  Request object.
  * @param  {Object} res  Response object.
  * @param  {Object} err  Stacktrace de error generado.
  * @param  {Object} user Instancia del usuario encontrado en el proceso de autenticación.
  * @param  {Object} info Stacktrace de informacion generada.
  * @return {Object}      Retorna un json el cual contiene un token de autorización
  *                               y la instancia de usuario encontrada.
  */
 function _onPassportAuth(req, res, err, user, info) {
   if (err) {
     return res.serverError(err);
   }
   if (!user) {
     sails.log.debug({code: info.code, msg: info.message})
     return res.serverError(info.code);
   }
   return res.ok({
     token: CriptoService.createToken(user),
     role: "COMPANY"
   });
 }

module.exports = {
	/**
   * Funcion para autenticar a un usuario.
   * @param  {Object} req  Request object.
   * @param  {Object} res  Response object.
   */
  signinUser: function(req, res) {
    passport.authenticate('local-user', _onPassportAuth.bind(this, req, res))(req, res);
  },
};
