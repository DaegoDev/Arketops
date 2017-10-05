/**
 * Politic to validate is a user have been signed in into a system.
 * A valid can to see the products available of a company with their respective discounts.
 */

var passport = require('passport');
module.exports = function(req, res, next) {
  passport.authenticate('jwt', function(err, user, info) {
    if (err) {
      return res.serverError(err);
    } else if (!user) {
      req.user = false;
      return next();
    }
    req.user = user;
    next();
  })(req, res);

};
