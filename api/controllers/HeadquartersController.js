/**
 * HeadquartersController
 *
 * @description :: Server-side logic for managing headquarters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   *  function to create a company's headquarters.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   * @return {Object}
   */
  create: function(req, res) {
    // Variables to create a headquarters;
    var country = null;
    var department = null;
    var city = null;
    var nomenclature = null;
    var phonenumber = null;
    var contact = null;
    var contactPhonenumber = null;
    var user = null;

    // Definition and validation of the variables inside the function.
    country = req.param('country');
    if (!country) {
      return res.badRequest('Country required.')
    }

    department = req.param('department');
    if (!department) {
      return res.badRequest('Department required.')
    }

    city = req.param('city');
    if (!city) {
      return res.badRequest('City required.')
    }

    nomenclature = req.param('nomenclature');
    if (!nomenclature) {
      return res.badRequest('Nomenclature required.')
    }

    phonenumber = req.param('phonenumber');
    if (!phonenumber) {
      return res.badRequest('Phonenumber required.')
    }

    contact = req.param('contact');
    if (!contact) {
      return res.badRequest('Contact required.')
    }

    contactPhonenumber = req.param('contactPhonenumber');
    if (!contactPhonenumber) {
      return res.badRequest('Phonenumber of the contact required.')
    }

    user = req.user;

    // Build the fields to create a headquarters.
    var headquartersParams = {
      country: country,
      department: department,
      city: city,
      nomenclature: nomenclature,
      phonenumber: phonenumber,
      contact: contact,
      contactPhonenumber: contactPhonenumber,
      main: false
    }

    Company.findOne({
        where: {
          userId: user.id,
        }
      })
      .then((company) => {
        if (company) {
          headquartersParams.companyId = company.id;
          return Headquarters.create(headquartersParams);
        }
        throw new Error('No se encontró el usuario');
      })
      .then((headquarters) => {
        sails.log.debug(headquarters);
        res.ok(headquarters);
      })
      .catch((err) => {
        sails.log.error(err);
        res.serverError();
      })
  },
  /**
   *  function to update a company's headquarters.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   * @return {Object}
   */
  update: function(req, res) {
    // Variables to update a headquarters;
    var country = null;
    var department = null;
    var city = null;
    var nomenclature = null;
    var phonenumber = null;
    var contact = null;
    var contactPhonenumber = null;
    var headquartersId = null;

    // Definition and validation of the variables inside the function.
    country = req.param('country');
    if (!country) {
      return res.badRequest('Country required.')
    }

    department = req.param('department');
    if (!department) {
      return res.badRequest('Department required.')
    }

    city = req.param('city');
    if (!city) {
      return res.badRequest('City required.')
    }

    nomenclature = req.param('nomenclature');
    if (!nomenclature) {
      return res.badRequest('Nomenclature required.')
    }

    phonenumber = req.param('phonenumber');
    if (!phonenumber) {
      return res.badRequest('Phonenumber required.')
    }

    contact = req.param('contact');
    if (!contact) {
      return res.badRequest('Contact required.')
    }

    contactPhonenumber = req.param('contactPhonenumber');
    if (!contactPhonenumber) {
      return res.badRequest('Phonenumber of the contact required.')
    }

    headquartersId = parseInt(req.param('headquartersId'));
    if (!headquartersId) {
      return res.badRequest('headquarters id required.')
    }


    // Build the fields to create a headquarters.
    var headquartersParams = {
      country: country,
      department: department,
      city: city,
      nomenclature: nomenclature,
      phonenumber: phonenumber,
      contact: contact,
      contactPhonenumber: contactPhonenumber,
      main: false
    }

    Headquarters.findOne({
        where: {
          id: headquartersId,
        }
      })
      .then((headquarters) => {
        if (headquarters) {
          return headquarters.update(headquartersParams);
        }
        throw new Error('Headquarters dont founded.');
      })
      .then((rowsAffected) => {
        return Headquarters.findOne({
          where: {
            id: headquartersId,
          }
        })
      })
      .then((headquarters) => {
        sails.log.debug(headquarters);
        res.ok(headquarters);
      })
      .catch((err) => {
        sails.log.error(err);
        res.serverError();
      })
  },
  /**
   *  function to delete a company's headquarters.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   * @return {Object}
   */
  delete: function(req, res) {
    // Variables to update a headquarters;
    var headquartersId = null;

    // Definition and validation of the variables inside the function.
    headquartersId = parseInt(req.param('headquartersId'));
    if (!headquartersId) {
      return res.badRequest('headquarters id required.')
    }

    Headquarters.destroy({
      where: {
        id: headquartersId
      }
    })
    .then(() => {
      res.ok()
    })
    .catch((err) => {
      sails.log.debug(err);
    })
  }
};
