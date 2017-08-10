/**
 * CompanyController
 *
 * @description :: Server-side logic for managing companies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Modulos requeridos.
var promise = require('bluebird');
var fs = require('fs');
var sizeOf = require('image-size');

module.exports = {
  /**
   *  función para registrar una empresa.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   * @return {Object}
   */
  signup: function(req, res) {
    // Inicialización de variables necesarias. los parametros necesarios viajan en el cuerpo
    // de la solicitud.
    var name = null;
    var nit = null;
    var businessOverview = null;
    var website = null;
    var imageURI = null;
    // variables necesarias para cargar la imagen.
    var imageFile = null;
    var tempLocation = null;

    var country = null;
    var department = null;
    var city = null;
    var nomenclature = null;
    var phonenumber = null;
    var contact = null;
    var contactPhonenumber = null;

    var email = null;
    var password = null;

    // Definición de variables apartir de los parametros de la solicitud y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un nombre.'
      });
    }

    nit = req.param('nit');
    if (!nit) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un nit.'
      });
    }

    businessOverview = req.param('businessOverview');
    if (!businessOverview) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar una descripción empresarial.'
      });
    }

    country = req.param('country');
    if (!country) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un país.'
      });
    }

    department = req.param('department');
    if (!department) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un departamento.'
      });
    }

    city = req.param('city');
    if (!city) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar una ciudad.'
      });
    }

    nomenclature = req.param('nomenclature');
    if (!nomenclature) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar una nomenclatura.'
      });
    }

    phonenumber = req.param('phonenumber');
    if (!phonenumber) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un telefono.'
      });
    }

    contact = req.param('contact');
    if (!contact) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un contacto.'
      });
    }

    contactPhonenumber = req.param('contactPhonenumber');
    if (!contactPhonenumber) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un número de teléfono del contacto.'
      });
    }

    email = req.param('email');
    if (!email) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un email.'
      });
    }

    password = req.param('password');
    if (!password) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar una contraseña.'
      });
    }

    website = req.param('website');
    imageFile = req.file('imageFile');

    var pathAvatars = sails.config.appPath + "/assets/images/avatars/";
    var tmpPathAvatars = sails.config.appPath + '/.tmp/public/images/uploads/';
    // Cargar la imagen en el directorio images/avatars
    imageFile.upload({
      dirname: pathAvatars
    }, function onUploadComplete(err, uploadedImage) {
      if (err) return res.serverError(err);
      imageURI = uploadedImage[0].fd;
      // tempLocation = tmpPathAvatars + filename;

      //Copy the file to the temp folder so that it becomes available immediately
      // fs.createReadStream(imageURI).pipe(fs.createWriteStream(tempLocation));

      // Organización de credenciales y cifrado de la contraseña del usuario.
      var userCredentials = createUserCredentials(email, password);

      var companyCredentials = createCompanyCredentials(name, nit, businessOverview, website, imageURI);

      var headquartersCredentials = createHeadquartersCredentials(country, department, city, nomenclature, phonenumber, contact, contactPhonenumber);

      // Se valida que el archivo tenga el formato y la resolución deseada.
      var dimensions = sizeOf(imageURI);
      sails.log.debug(dimensions);
      if (dimensions.width > 800 || dimensions.height > 800 || (dimensions.type != "png" && dimensions.type != "jpeg" && dimensions.type != "jpg")) {
        fs.unlink(imageURI, (err) => {
          if (err) throw err;
          sails.log.debug('Se borró la imagen');
        });
        return res.badRequest("La configuración del archivo no es valida");
      }

      // Se verifica que el usuario no exista antes de su creación, en caso de que exista
      // se retorna un error de conflicto con codigo de error 409. En caso de que no exista
      // se crea el regitro del usuario.
      return sequelize.transaction(function(t) {
        return User.findOne({
            where: {
              email: email
            }
          }, {
            transaction: t
          })
          .then(function(user) {
            if (!user) {
              return User.create(userCredentials, {
                transaction: t
              })
            } else {
              throw "err";
            }
          })
          .then(function(user) {
            // sails.log.debug(user);
            return user.setCompany(Company.build(companyCredentials), {
              transaction: t
            });
          })
          .then(function(company) {
            headquartersCredentials.companyId = company.id;
            return Headquarters.create(headquartersCredentials, {
              transaction: t
            });
          })
      }).then(function(result) {
        // Transaction has been committed
        res.ok(result);
      }).catch(function(err) {
        fs.unlink(imageURI, (err) => {
          if (err) throw err;
          sails.log.debug('Se borró la imagen');
        });
        // Transaction has been rolled back
        res.serverError(err);
      });
    });
  },
  /**
   * Función para actulizar los datos de una empresa.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   * @return {Object}
   */
  updateData: function(req, res) {
    // Inicialización de variables necesarias. los parametros necesarios viajan en el cuerpo
    // de la solicitud.
    var name = null;
    var nit = null;
    var businessOverview = null;
    var website = null;

    var country = null;
    var department = null;
    var city = null;
    var nomenclature = null;
    var phonenumber = null;
    var contact = null;
    var contactPhonenumber = null;
    var email = null;
    var user = null;

    // Definición de variables apartir de los parametros de la solicitud y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un nombre.'
      });
    }

    nit = req.param('nit');
    if (!nit) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un nit.'
      });
    }

    businessOverview = req.param('businessOverview');
    if (!businessOverview) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar una descripción empresarial.'
      });
    }

    country = req.param('country');
    if (!country) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un país.'
      });
    }

    department = req.param('department');
    if (!department) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un departamento.'
      });
    }

    city = req.param('city');
    if (!city) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar una ciudad.'
      });
    }

    nomenclature = req.param('nomenclature');
    if (!nomenclature) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar una nomenclatura.'
      });
    }

    phonenumber = req.param('phonenumber');
    if (!phonenumber) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un telefono.'
      });
    }

    contact = req.param('contact');
    if (!contact) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un contacto.'
      });
    }

    contactPhonenumber = req.param('contactPhonenumber');
    if (!contactPhonenumber) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un número de teléfono del contacto.'
      });
    }

    email = req.param('email');
    if (!email) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un email.'
      });
    }

    website = req.param('website');
    // user = req.user;
    userId = 2;
    // Organización de credenciales.

    var companyCredentials = createCompanyCredentials(name, nit, businessOverview, website, null);

    var headquartersCredentials = createHeadquartersCredentials(country, department, city, nomenclature, phonenumber, contact, contactPhonenumber);

    // Se verifica que el usuario exista y este activo antes de su actualización, en caso de que no exista
    // se retorna un error de conflicto con codigo de error 409. En caso de que exista
    // se actualiza el regitro del usuario.
    return sequelize.transaction(function(t) {
      return User.findOne({
          where: {
            id: userId,
            state: true
          }
        }, {
          transaction: t
        })
        .then(function(user) {
          if (user) {
            User.update({
              email: email
            }, {
              where: {
                id: userId
              },
              transaction: t
            });
            return Company.findOne({
              where: {
                userId: userId
              }
            })
          } else {
            throw "El usuario no existe o está desactivado";
          }
        })
        .then(function(company) {
          company.update(companyCredentials, {
            transaction: t
          });
          return Headquarters.update(headquartersCredentials, {
            where: {
              companyId: company.id
            },
            transaction: t
          });
        })
    }).spread(function(affectedCount, affectedRows) {
      // Transaction has been committed
      res.ok(affectedRows);
    }).catch(function(err) {
      // Transaction has been rolled back
      res.serverError(err);
    });

  },
  /**
   * Función para actualizar la imagen de perfil de un usuario.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  updateImageProfile: function(req, res) {
    // Se declara las variables necesarias para actualizar la imagen de perfil de un cliente
    var user = null;
    var imageURI = null;
    var imageURIDB = null;
    // variables necesarias para cargar la imagen.
    var imageFile = null;
    var tempLocation = null;

    // Definición de las variables.
    imageFile = req.file('imageFile');
    // user = req.user;
    user = {
      id: 11
    }

    Company.findOne({
        where: {
          userId: user.id
        }
      })
      .then(function(company) {
        imageURIDB = company.imageURI;
        var pathAvatars = sails.config.appPath + "/assets/images/avatars/";
        //   var tmpPathAvatars = sails.config.appPath + '/.tmp/public/images/uploads/';

        // Cargar la imagen en el directorio images/avatars
        imageFile.upload({
          dirname: pathAvatars
        }, function onUploadComplete(err, uploadedImage) {
          if (err) return res.serverError(err);
          imageURI = uploadedImage[0].fd;
          // tempLocation = tmpPathAvatars + filename;

          //Copy the file to the temp folder so that it becomes available immediately
          // fs.createReadStream(imageURI).pipe(fs.createWriteStream(tempLocation));

          // Se valida que el archivo tenga el formato y la resolución deseada.
          sizeOf = promise.promisify(sizeOf);
          sizeOf(imageURI)
            .then(function(dimensions) {
              sails.log.debug(dimensions);
              if (dimensions.width > 800 || dimensions.height > 800 || (dimensions.type != "png" && dimensions.type != "jpeg" && dimensions.type != "jpg")) {
                throw "La configuración del archivo no es valida";
              }
              return company.update({
                imageURI: imageURI
              })
            })
            .then(function(AmountRowsAffected) {
              if (imageURIDB) {
                fs.unlink(imageURIDB, (err) => {
                  if (err) throw err;
                  sails.log.debug('Se borró la imagen vieja');
                });
              }
              res.ok(imageURI);
            })
            .catch(function(err) {
              fs.unlink(imageURI, (err) => {
                if (err) throw err;
                sails.log.debug('Se borró la imagen nueva');
              });
              res.serverError(err);
            })
        });
      })
      .catch(function(err) {
        res.serverError(err);
      })
  },
  /**
   * Función para actualizar la contraseña de un usuario.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  updatePassword: function(req, res) {
    // Se declara las variables necesarias para actualizar la contraseña de un cliente
    var user = req.user;
    var currentPassword = req.param('currentPassword');
    var newPassword = req.param('newPassword');

    // valida si existe el cliente con el id, si existe cambia la contraseña de su usuario en false
    User.findOne({
        where: {
          id: user.id
        }
      })
      .then(function(user) {
        if (CriptoService.compararHash(currentPassword, user.password)) {
          newPassword = CriptoService.hashValor(newPassword);
          return user.update({
            password: newPassword
          });
        } else {
          throw 'Error con contraseña actual';
        }
      })
      .then(function(user) {
        return res.ok();
      })
      .catch(function(err) {
        sails.log.debug(err);
        res.serverError();
      });
  },
  /**
   * Función para desactivar la cuenta de un usuario.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  deactivateAccount: function(req, res) {
    // Declaración de variables
    var user = null;
    user = req.user;

    // Se valida que el usuario exista, en caso de que exita se cambia el estado a false.
    User.findOne({
        where: {
          id: user.id
        }
      })
      .then(function(user) {
        if (user) {
          return user.update({
            state: false
          })
        }
        throw "El usuario no existe";
      })
      .then(function(countUserUpdated) {
        res.ok();
      })
      .catch(function(err) {
        res.serverError();
      })
  },
  /**
   * Función para seguir a una empresa registrada.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  followCompany: function(req, res) {
    // Declaración de variables
    var user = null;
    var supplierId = null;

    // Definición de variables y validaciones.
    var supplierId = req.param("supplierId");
    if (!supplierId) {
      res.badRequest("El id del proveedor es vacio");
    }

    // user = req.user;
    user = {
      id: 5
    }

    Company.findAll({
        include: [User],
        where: {
          id: supplierId
        }
      })
      .then(function(supplier) {
        if (supplier[0] && supplier[0].User.state) {
          return supplier[0].addClients(user.id)
        }
        throw "La empresa no existe"
      })
      .then(function(clientSupplier) {
        res.ok(clientSupplier[0][0]);
      })
      .catch(function(err) {
        res.serverError(err);
      })
  },
  /**
   * Función para buscar a una empresa por su nombre.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getByName: function(req, res) {
    // Declaración de variables.
    var name = null;

    // Definición de variables y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un nombre.'
      });
    }

    Company.findAll({
        where: {
          name: {
            $iLike: '%' + name + '%'
          }
        }
      })
      .then(function(companies) {
        res.ok(companies);
      })
      .catch(function(err) {
        sails.log.debug(err);
        res.serverError(err);
      })
  },
  /**
   * Función para buscar empresa o producto por palabra o frase clave de su nombre o descripción.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  searchAll: function(req, res) {
    // Declaración de variables.
    var keyword = null;
    var result = {};

    // Definición de variables y validaciones.
    keyword = req.param('keyword');
    if (!keyword) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar alguna palabra.'
      });
    }

    Product.findAll({
        where: {
          $or: [{
            name: {
              $iLike: '%' + keyword + '%'
            }
          }, {
            description: {
              $iLike: '%' + keyword + '%'
            }
          }]
        },
        include: [{
          model: ElementData,
          include: [{
            model: Element,
          }]
        }, {
          model: Company,
          attributes: ['name', 'id']
        }]
      })
      .then(function(products) {
        result.products = products
        return Company.findAll({
          where: {
            $or: [{
              name: {
                $iLike: '%' + keyword + '%'
              }
            }, {
              businessOverview: {
                $iLike: '%' + keyword + '%'
              }
            }]
          }
        })
      })
      .then(function(companies) {
        result.companies = companies;
        res.ok(result);
      })
      .catch(function(err) {
        sails.log.debug(err);
        res.serverError(err);
      })
  },
  /**
   * Función para obtener los clientes de una empresa.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getClients: function(req, res) {
    // Declaración de variables.
    var user = null;

    //  user = req.user;
    user = {
      id: 2
    }

    Company.findOne({
        where: {
          userId: user.id
        }
      })
      .then(function(company) {
        return company.getClients()
      })
      .then(function(clients) {
        res.ok(clients);
      })
      .catch(function(err) {
        res.serverError(err);
      })
  },
  /**
   * Función para obtener los proveedores de una empresa.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getSuppliers: function(req, res) {
    // Declaración de variables.
    var user = null;

    //  user = req.user;
    user = {
      id: 3
    }

    Company.findOne({
        where: {
          userId: user.id
        }
      })
      .then(function(company) {
        return company.getSuppliers()
      })
      .then(function(suppliers) {
        res.ok(suppliers);
      })
      .catch(function(err) {
        res.serverError(err);
      })
  },
  /**
   * Función para asignar un descuento a un elemento para un cliente.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  setDiscountToClient: function(req, res) {
    // Declaración de variables.
    var user = null;
    var clientId = null;
    var elementDataId = null;
    var discount = null;

    // Definición de variables y validaciones;
    clientId = parseInt(req.param('clientId'));
    if (!clientId) {
      return res.badRequest('Id del cliente vacío');
    }

    elementDataId = parseInt(req.param('elementDataId'));
    if (!elementDataId) {
      return res.badRequest('Id del elemento vacío')
    }

    discount = parseInt(req.param('discount'));
    if (!discount) {
      return res.badRequest('Descuento vacío')
    }

    //  user = req.user;
    user = {
      id: 1
    }

    // Se verifica que la empresa con clientId en verdad sea un cliente.
    ClientSupplier.findOne({
        where: {
          supplierId: user.id,
          clientId: clientId
        }
      })
      .then(function(clientSupplier) {
        if (clientSupplier) {
          return Promise.all = [clientSupplier, ElementData.findOne({where: {id: elementDataId, userId: user.id}})];
        }
        throw "No es cliente";
      })
      .spread(function(clientSupplier, elementData) {
        if (elementData) {
          elementData.ClientDiscount = {
            discount: discount
          }
          return clientSupplier.addElementData(elementData);
        }
        throw "El elemento no existe o no es del proveedor";
      })
      .then(function(clientDiscount) {
        res.ok(clientDiscount[0]);
      })
      .catch(function(err) {
        res.serverError(err);
      })

  },
  /**
   * Función para modificar un descuento a un elemento para un cliente.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  updateDiscountToClient: function(req, res) {
    // Declaración de variables.
    var clientDiscountId = null;
    var newDiscount = null;

    // Definición de variables y validaciones;
    clientDiscountId = parseInt(req.param('clientDiscountId'));
    if (!clientDiscountId) {
      return res.badRequest('Id del descuento para el cliente vacío');
    }

    newDiscount = parseInt(req.param('newDiscount'));
    if (!newDiscount) {
      return res.badRequest('Descuento vacío')
    }

    // Se verifica que el descuento con id clientDiscountId para el cliente exista.
    ClientDiscount.findById(clientDiscountId)
      .then(function(clientDiscount) {
        if (clientDiscount) {
          return clientDiscount.update({
            discount: newDiscount
          });
        }
        throw "El cliente no tiene asignado un descuento con ese id";
      })
      .then(function(clientDiscount) {
        res.ok(clientDiscount);
      })
      .catch(function(err) {
        res.serverError(err);
      })

  }
};

// crea las credenciales para insertar un usuario
function createUserCredentials(email, password) {
  password = CriptoService.hashValor(password);
  var userCredentials = {
    email: email,
    password: password,
    state: true
  };
  return userCredentials;
};

// crea las credenciales para insertar una empresa
function createCompanyCredentials(name, nit, businessOverview, website, imageURI) {
  var companyCredentials = {
    name: name,
    nit: nit,
    businessOverview: businessOverview,
    website: website
  };
  if (imageURI) {
    companyCredentials.imageURI = imageURI;
  }
  return companyCredentials;
}

// Crea las credenciales para insertar una sede.
function createHeadquartersCredentials(country, department, city, nomenclature, phonenumber,
  contact, contactPhonenumber) {
  var headquartersCredentials = {
    country: country,
    department: department,
    city: city,
    nomenclature: nomenclature,
    phonenumber: phonenumber,
    contact: contact,
    contactPhonenumber: contactPhonenumber,
    main: true
  };
  return headquartersCredentials;
}
