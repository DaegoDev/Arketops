/**
 * 409 (DUPLICATED) Response
 *
 * Usage:
 * return res.duplicated();
 * return res.duplicated(data);
 * return res.duplicated(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function duplicated (data, options) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  sails.log.verbose('res.duplicated() :: Sending 409 ("DUPLICATED") response');

  // Set status code
  res.status(409);

  data = !data ? {} : data;

  // If appropriate, serve data as JSON(P)
  // If views are disabled, revert to json
  if (req.wantsJSON || sails.config.hooks.views === false) {
    data.code = 3;
    data.message = "Duplicated entry."
    return res.jsonx(data);
  }

  // If second argument is a string, we take that to mean it refers to a view.
  // If it was omitted, use an empty object (`{}`)
  options = (typeof options === 'string') ? { view: options } : options || {};

  // Attempt to prettify data for views, if it's a non-error object
  var viewData = data;
  if (!(viewData instanceof Error) && 'object' == typeof viewData) {
    try {
      viewData = require('util').inspect(data, {depth: null});
    }
    catch(e) {
      viewData = undefined;
    }
  }

  // If a view was provided in options, serve it.
  // Otherwise try to guess an appropriate view, or if that doesn't
  // work, just send JSON.
  if (options.view) {
    return res.view(options.view, { data: viewData, title: 'Duplicated entry' });
  }

  // If no second argument provided, try to serve the implied view,
  // but fall back to sending JSON(P) if no view can be inferred.
  else return res.guessView({ data: viewData, title: 'Duplicated' }, function couldNotGuessView () {
    return res.jsonx(data);
  });

};
