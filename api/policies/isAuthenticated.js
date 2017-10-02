/**
 * Politica para la autorización de un usuario valido del sitema.
 * Un usuario valido puede ser cualquier usuario de rol administrador, despachador o cliente
 * que posea un token valido.
 */
const ENABLED = true;
var passport = require('passport');
module.exports = function (req, res, next) {
  if (!ENABLED) {
    next();
  } else {
    passport.authenticate('jwt', function (err, user, info) {
      if (err) {
        return res.serverError(err);
      } else if (!user) {
        return res.forbidden(null, info && info.code, info && info.message);
      }
      req.user = user;
      next();
    })(req, res);
  }
};
