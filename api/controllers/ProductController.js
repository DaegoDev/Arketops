/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Modulos requeridos.
var promise = require('bluebird');
var fs = require('fs');
var sizeOf = require('image-size');
var path = require('path');
const maxSize = 10000000; // Tamaño maximo en bytes

module.exports = {
  /**
   * Función para crear un producto o servicio.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  create: function(req, res) {
    // Declaración de variables.
    var code = null;
    var name = null;
    var description = null;
    var elements = [];
    var price = null;
    var stateId = null;
    var user = null;
    var addedElements = [];
    var imageURI = null;
    // variables necesarias para cargar la imagen.
    var imageFile = null;
    // var tempLocation = null;

    var productCredentials = null;

    // Definición de las variables y validaciones.
    elements = req.param("elements");
    if (!elements) {
      return res.badRequest({
        code: 1,
        msg: 'There are no enough elements'
      });
    }

    elements.forEach(function(element, i, elementsList) {
      index = addedElements.indexOf(element);
      if (index != -1) {
        return res.badRequest({
          code: 2,
          msg: 'There are repeated elements.'
        });
      } else {
        addedElements.push(element);
      }
    });

    code = req.param('code');
    if (!code) {
      return res.badRequest('Código del producto vacío');
    }

    name = req.param('name');
    if (!name) {
      return res.badRequest('Nombre del producto vacío');
    }

    description = req.param('description');
    if (!description) {
      return res.badRequest('Descripción del producto vacío');
    }

    price = req.param('price');
    if (!price) {
      return res.badRequest('Precio del producto vacío');
    }

    stateId = parseInt(req.param('stateId'));
    if (!stateId) {
      return res.badRequest('Id del estado vacío');
    }

    user = req.user;
    imageDataURI = req.param('imageDataURI');

    var relativePath = "/resources/images/products/";
    var appPath = sails.config.appPath;

    return sequelize.transaction(function(t) {
      var company;
      var product;

      return Company.findOne({
          where: {
            userId: user.id
          },
          transaction: t
        })
        .then(function(company) {
          return Promise.all = [
            company,
            company.getProducts({
              where: {
                code: code
              },
              transaction: t
            })
          ];
        })

        .spread(function(companyInst, products) {
          var absolutePath = null;

          if (products.length != 0) {
            throw {
              errResponse: res.duplicated
            };
          }
          company = companyInst;

          if (!imageDataURI) {
            return promise.resolve(0);
          } else {
            absolutePath = path.join(appPath, relativePath, company.nit + "-" + code + "-" + Date.now());
            return ImageDataURIService.decodeAndSave(imageDataURI, absolutePath);
          }
        })

        .then(function(resUpload) {
          if (imageDataURI) {
            imageURI = resUpload;
            relativePath = relativePath + path.basename(resUpload);

            // Se valida que el archivo tenga el formato y la resolución deseada.
            var dimensions = sizeOf(resUpload);
            if (dimensions.type.toLowerCase() != "png" && dimensions.type.toLowerCase() != "jpeg" && dimensions.type.toLowerCase() != "jpg") {
              sails.log.debug("Processing image error.")
              throw {
                errResponse: res.wrongFormatUpload
              };
            }
          } else {
            relativePath = null;
          }

          // Creación de las credenciales para crear un producto.
          productCredentials = {
            code: code,
            name: name,
            description: description,
            price: price,
            stateId: stateId,
            imageURI: relativePath,
            companyId: company.id
          }
          return Product.create(productCredentials, {
            transaction: t
          });
        })

        .then(function(newProduct) {
          product = newProduct;
          return ElementData.findAll({
            where: {
              id: {
                $in: elements
              }
            }
          });
        })

        .then(function(result) {
          return product.addElementData(result);
        })

        .then(function(finalProduct) {
          return res.ok(finalProduct);
        })

        .catch(function(err) {
          if (imageURI != null && imageDataURI) {
            fs.unlink(imageURI, (err2) => {
              if (err2) {
                throw err2;
              }
              sails.log.debug('Se borró la imagen');
            });
          }
          sails.log.debug(err);
          if (!err.errResponse) {
            return res.serverError();
          }
          return err.errResponse();
        })
    });
  },
  /**
   * Función para editar un producto o servicio.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  update: function(req, res) {
    // Declaración de variables.
    var productId = null;
    var code = null;
    var name = null;
    var description = null;
    var elements = [];
    var price = null;
    var stateId = null;
    var user = null;

    var addedElements = [];
    var elementsToSet = [];
    var mainElement = null;

    var productCredentials = null;

    user = req.user;

    // Definición de las variables y validaciones.
    elements = req.param("elements");
    if (typeof elements == 'string') {
      return res.badRequest({
        code: 1,
        msg: 'There are no enough elements'
      });
    } else {
      elements.forEach(function(element, i, elementsList) {
        index = addedElements.indexOf(element);
        if (index != -1) {
          return res.badRequest({
            code: 2,
            msg: 'There are repeated elements.'
          })
        } else {
          addedElements.push(element);
        }
      })
    }

    productId = parseInt(req.param('productId'));
    if (!productId) {
      return res.badRequest('Id del producto vacío');
    }

    code = req.param('code');
    if (!code) {
      return res.badRequest('Códio del producto vacío');
    }

    name = req.param('name');
    if (!name) {
      return res.badRequest('Nombre del producto vacío');
    }

    description = req.param('description');
    if (!description) {
      return res.badRequest('Descripción del producto vacío');
    }

    price = req.param('price');
    if (!price) {
      return res.badRequest('Precio del producto vacío');
    }

    stateId = parseInt(req.param('stateId'));
    if (!stateId) {
      return res.badRequest('Id del estado vacío');
    }

    return sequelize.transaction(function(t) {
        return Company.findOne({
            where: {
              userId: user.id
            },
            transaction: t
          })
          .then(function(company) {
            return company.getProducts({
              where: {
                code: code
              },
              transaction: t
            });
          })
          .then(function(products) {
            if (products.length == 1 && products[0].id != productId) {
              throw {
                errResponse: res.duplicated
              };
            } else if (products.lenth > 1) {
              throw {
                errResponse: res.badRequest
              };
            }

            return Product.findOne({
              where: {
                id: productId
              },
              include: [{
                model: Company,
                where: {
                  userId: user.id
                }
              }]
            });
          })
          .then(function(product) {
            if (!product) {
              throw {
                errResponse: res.badRequest
              };
            }
            // Creación de las credenciales para crear un producto.
            productCredentials = {
              code: code,
              name: name,
              description: description,
              price: price,
              stateId: stateId,
            };
            return product.update(productCredentials, {
              where: {
                id: productId
              },
              transaction: t
            });
          })
          .then(function(product) {
            if (!product) {
              throw {
                errResponse: res.serverError
              };
            }

            return Promise.all = [
              product,
              ElementData.findAll({
                where: {
                  id: {
                    $in: elements
                  }
                }
              })
            ];
          })
          .spread(function(product, elementData) {
            return product.setElementData(elementData, {
              transaction: t
            });
          });
      })
      .then(function(result) {
        return res.ok(result);
      })
      .catch(function(err) {
        if (err.errResponse) {
          return err.errResponse();
        }

        return res.serverError(err);
      });
  },

  /**
   * Función para eliminar un producto o servicio.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  delete: function(req, res) {
    // Declaración de variables.
    var productId = null;
    var user = null;

    // Obtenemos la información del usuario que llama el servicio.
    user = req.user;
    if (!user) {
      return res.forbidden();
    }

    // Definición de las variables y validaciones.
    productId = parseInt(req.param('productId'));
    if (!productId) {
      return res.badRequest('Id del producto vacío');
    }

    // Se verifica que el producto exista, en caso de que exista se actualiza el campo enabled a false.
    Product.findById(productId, {
        include: [{
          model: Company,
          where: {
            userId: user.id
          }
        }]
      })
      .then(function(product) {
        if (product) {
          return product.update({
            enabled: false
          })
        }
        throw "El producto no existe";
      })
      .then(function() {
        return res.ok()
      })
      .catch(function(err) {
        return res.serverError(err);
      })
  },

  /**
   * Función para obtener los productos o servicios de un usuario atenticado.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getMyProducts: function(req, res) {
    // Declaración de variables.
    var user = null;
    var productList = null;

    // Definición de variables.
    user = req.user;
    if (!user) {
      return res.forbidden();
    }

    Product.findAll({
        where: {
          enabled: true
        },
        include: [{
            model: ElementData,
            include: [{
              model: Element
            }]
          },
          {
            model: Company,
            where: {
              userId: user.id
            }
          }
        ],
        order: [
          [ElementData, Element, 'id', 'ASC']
        ]
      })
      .then(function(products) {
        productList = products;
        var promises = [];
        var promiseFunction = function(product) {
          if (!product.imageURI) {
            return;
          }

          return ImageDataURIService.encode(path.resolve(sails.config.appPath + product.imageURI))
            .then((imageDataURI) => {
              product.imageURI = imageDataURI;
            })
            .catch((err) => {
              sails.log.debug(err)
            })
        }

        productList.forEach(function(product, index) {
          promises.push(promiseFunction(product));
        });

        return promise.all(promises);
      })
      .then(function(data) {
        return res.ok(productList);
      })
      .catch(function(err) {
        return res.serverError(err);
      });
  },

  /**
   * Función para obtener los productos o servicios de un usuario atenticado.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getMyProductsToQuote: function(req, res) {
    // Declaración de variables.
    var user = null;
    var clientId = null;

    clientId = parseInt(req.param('clientId'));
    if (!clientId) {
      return res.badRequest('ClientId required')
    }

    // Definición de variables.
    user = req.user;

    Product.findAll({
        where: {
          enabled: true
        },
        include: [{
            model: ElementData,
            include: [{
              model: Element
            }, {
              model: ClientSupplier,
              where: {
                id: clientId
              },
              required: false
            }]
          },
          {
            model: Company,
            where: {
              userId: user.id
            }
          }
        ],
        order: [
          [ElementData, Element, 'id', 'ASC']
        ]
      })
      .then(function(products) {
        return res.ok(products)
      })
      .catch(function(err) {
        return res.serverError(err);
      });
  },
  /**
   * Función para obtener los productos o servicios por nombre.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getByName: function(req, res) {
    // Declaración de variables.
    var name = null;
    var productList = [];

    // Definición de variables y validaciones.
    name = req.param('name');
    if (!name) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar un nombre.'
      });
    }

    Product.findAll({
        where: {
          name: {
            $iLike: '%' + name + '%'
          }
        },
        include: [{
          model: ElementData,
          include: [{
            model: Element,
          }]
        }, {
          model: Company,
          attributes: ['name', 'id'],
          include: [{
            model: User,
            attributes: {
              exclude: ['password']
            },
            where: {
              state: true
            }
          }]
        }]
      })
      .then(function(products) {
        productList = products;
        var promises = [];
        var promiseFunction = function(product) {
          product.dataValues.type = 2;
          if (!product.imageURI) {
            return Promise.resolve();
          }
          return ImageDataURIService.encode(path.resolve(sails.config.appPath + product.imageURI))
            .then((imageDataURI) => {
              product.imageURI = imageDataURI;
            })
            .catch((err) => {
              sails.log.debug(err)
            })
        }

        productList.forEach(function(product, index) {
          promises.push(promiseFunction(product));
        });

        return promise.all(promises);
      })
      .then((data) => {
        return res.ok(productList);
      })
      .catch(function(err) {
        sails.log.debug(err);
        return res.serverError(err);
      })
  },
  /**
   * Función para obtener los productos o servicios de una empresa.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getByCompany: function(req, res) {
    // Declaración de variables.
    var companyId = null;
    var isSignedIn = null;
    var company = null;
    var productList = [];

    // Definición de variables y validaciones.
    companyId = parseInt(req.param('companyId'));
    if (!companyId) {
      return res.badRequest({
        code: 1,
        msg: 'Se debe ingresar el id de una empresa.'
      });
    }

    isSignedIn = req.user ? true : false;

    Company.findOne({
        where: {
          id: companyId
        }
      })
      .then((companyDB) => {
        if (!companyDB) {
          throw new Error("La empresa no existe");
        } else if (!isSignedIn) {
          return false;
        }
        company = companyDB;
        // return company.hasClients(req.user.id);
        return Company.findOne({
            where: {
              userId: req.user.id
            }
          })
          .then((userData) => {
            return ClientSupplier.findOne({
              where: {
                clientId: userData.id,
                supplierId: company.id
              }
            })
          })
      })
      .then((clientSupplier) => {
        return Product.findAll({
          include: [{
            model: ElementData,
            attributes: {
              exclude: [clientSupplier ? '' : 'discount']
            },
            include: [{
                model: Element,
              },
              clientSupplier ? {
                model: ClientSupplier,
                // where: {
                //   id: clientSupplier.id,
                // },
                // required: false
              } : {
                model: User,
                exclude: ['password']
              }
            ]
          }],
          where: {
            companyId: companyId
          }
        })
      })
      .then(function(products) {
        productList = products;
        var promises = [];
        var promiseFunction = function(product) {
          return ImageDataURIService.encode(path.resolve(sails.config.appPath + product.imageURI))
            .then((imageDataURI) => {
              product.dataValues.type = 2;
              product.imageURI = imageDataURI;
            })
            .catch((err) => {
              sails.log.debug(err)
            })
        }

        productList.forEach(function(product, index) {
          promises.push(promiseFunction(product));
        });

        return promise.all(promises);
      })
      .then((data) => {
        res.ok(productList);
      })
      .catch(function(err) {
        res.serverError(err);
      })
  },

  /**
   * Función para obtener los estados en los que se puede encontrar un productos.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getStates: function(req, res) {
    State.findAll()
      .then(function(states) {
        return res.ok(states);
      })
      .catch(function(err) {
        return res.serverError(err);
      });
  },

  /**
   * Función para pasar el portafolio a pdf.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  portfolioToPDF: function(req, res) {
    // Declaración de variables.
    var user = null;
    var elementsDataDiscounts = null;
    var relativePathPortfolio = null;
    var portfolioPathFile = null;
    var elementDataIds = [];
    var queryJSON = {};

    elementsDataDiscounts = JSON.parse(req.param('elementsDataDiscounts'));

    sails.log.debug(elementsDataDiscounts);
    for (var key in elementsDataDiscounts){
      elementsDataDiscounts[key].forEach((elementData) => {
        elementDataIds.push(elementData.id);
      })
    }

    sails.log.debug(elementDataIds)

    user = req.user;
    relativePathPortfolio = '/resources/documents/portfolio/tmp/' + CriptoService.generateString(9) + '.pdf';
    portfolioPathFile = sails.config.appPath + relativePathPortfolio;

    if (!user) {
      return res.forbidden();
    }

    queryJSON = {
      where: {
        userId: user.id
      },
      include: [{
        model: Product,
        where: {
          enabled: true,
        },
        include: [{
          model: ElementData,
          include: [{
            model: Element
          }]
        }],
        order: [
          [ElementData, Element, 'id', 'ASC']
        ]
      }]
    }

    if (elementDataIds.length > 0) {
      queryJSON.include[0].include[0].where = {
        id: elementDataIds
      }
    }

    Company.findOne(queryJSON)
      .then(function(company) {
        sails.log.debug(company);
        if (!company) {
          return res.notFound();
        }
        var companyDataToPrint = {
          imageURI: company.imageURI,
          name: company.name,
          businessOverview: company.businessOverview,
        }

        // Construye la configuración inicial para el documento.
        PortfolioPDFService.builInitialConfig('LETTER', 20, 50, 35, 50);

        // Construye la primer sección con la información del proveedor.
        PortfolioPDFService.buildContentSupplier(companyDataToPrint);

        // Construye la tabla de productos.
        PortfolioPDFService.buildTableProducts(company.Products, elementsDataDiscounts);

        // Guarda el documento pdf en la ruta pasada como parametro.
        PortfolioPDFService.saveDocument(portfolioPathFile);

        setTimeout(function () {
          res.sendfile(portfolioPathFile)
          setTimeout(function () {
            fs.unlink(portfolioPathFile, (err) => {
              if (err) throw err;
              sails.log.debug('Se borró el catálogo');
            });
          }, 2000);
        }, 2000);
      })
      .catch(function(err) {
        return res.serverError(err);
      });
  },

  updateImage: function(req, res) {
    var productId = null;
    var user = null;
    var imageURI = null;
    var imageURIDB = null;
    var absolutePath = null;
    // variables necesarias para cargar la imagen.
    var imageDataURI = null;
    // var tempLocation = null;

    // Definición de las variables.
    productId = req.param('productId');
    if (!productId) {
      return res.badRequest("productId de la imagen vacío.")
    }

    imageDataURI = req.param('imageDataURI');
    if (!imageDataURI) {
      return res.badRequest("DataURI de la imagen vacío.")
    }
    user = req.user;

    var relativePath = "/resources/images/products/";
    var appPath = sails.config.appPath;

    promise.all([
      Company.findOne({where: {id: user.id}}),
      Product.findOne({where: {id: productId}})
    ])
    .spread(function(company, product) {
      var newNameImage = null;
      if (product.imageURI) {
        imageURIDB = appPath + product.imageURI;
      }
      absolutePath = path.join(appPath, relativePath, company.nit + "-" + Date.now());
      return Promise.all = [product, ImageDataURIService.decodeAndSave(imageDataURI, absolutePath)]
    })
    .spread((product, resUpload) => {
      if (resUpload) {
        imageURI = resUpload;
        // Se valida que el archivo tenga el formato y la resolución deseada.
        var dimensions = sizeOf(imageURI);
        var imageFile = fs.statSync(resUpload)
        var fileSize = imageFile.size;
        var type = dimensions.type.toLowerCase();

        if (fileSize > maxSize || (type != "png" && type != "jpeg" && type != "jpg")) {
          fs.unlink(imageURI, (err) => {
            sails.log.debug('Se borró la imagen');
          });
          throw new Error("La configuración del archivo no es valida");
        }
      }
      relativePath = relativePath + path.basename(resUpload);
      return product.update({imageURI: relativePath});
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
  },

};
