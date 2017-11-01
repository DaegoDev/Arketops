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
    if (typeof elements != 'string') {
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
      })
    }

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

    var relativePath = "/assets/images/products/";
    var appPath = sails.config.appPath;
    var imagePath = null;

    return sequelize.transaction(function(t) {
      var imageURI;
      var company;
      var product;

      return Company.findAll({
          where: {
            userId: user.id
          },
          transaction: t
        })

        .then(function(company) {
          return Promise.all = [
            company[0],
            company[0].getProducts({
              where: {
                code: code
              },
              transaction: t
            })
          ];
        })

        .spread(function(companyInst, products) {
          if (products.length == 0) {
            company = companyInst;
            relativePath = path.join(relativePath, company.nit + "-" + code + "-" + Date.now());
            imagePath = path.join(appPath, relativePath);
            sails.log.debug(imagePath);
            return ImageDataURIService.decodeAndSave(imageDataURI, imagePath)
          }
          throw "Ya existe un producto con ese código";
        })

        .then(function(resUpload) {
          if (resUpload) {
            imageURI = resUpload;
            relativePath = imageURI.replace(appPath, "");

            // Se valida que el archivo tenga el formato y la resolución deseada.
            var dimensions = sizeOf(imageURI);
            if (dimensions.type != "png" && dimensions.type != "jpeg" && dimensions.type != "jpg") {
              fs.unlink(imageURI, (err) => {
                sails.log.debug('Se borró la imagen');
              });
              throw new Error("La configuración del archivo no es valida");
            }
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
          sails.log.debug(product);
          return product.addElementData(result);
        })
        .then(function(finalProduct) {
          sails.log.debug(finalProduct)
          return res.ok(finalProduct);
        })
        .catch(function(err) {
          fs.unlink(imageURI, (err) => {
            if (err) throw err;
            sails.log.debug('Se borró la imagen');
          });
          sails.log.debug(err);
        })
    });
  },
  /**
   * Función para editar un producto o servicio.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  edit: function(req, res) {
    // Declaración de variables.
    var code = null;
    var name = null;
    var description = null;
    var elements = [];
    var price = null;
    var stateId = null;
    var productId = null;
    var user = null;
    var addedElements = [];
    var elementsToSet = [];
    var mainElement = null;
    var productCredentials = null;

    // Definición de las variables y validaciones.
    elements = req.param("elements");
    if (typeof elements == 'string') {
      return res.badRequest({
        code: 1,
        msg: 'There are no enough elements'
      });
    } else {
      elements.forEach(function(element, i, elementsList) {
        element = JSON.parse(element)
        elementsList[i] = element;
        index = addedElements.indexOf(elementsList[i].name.toUpperCase().trim());
        if (index != -1) {
          return res.badRequest({
            code: 2,
            msg: 'There are repeated elements.'
          })
        } else {
          addedElements.push(elementsList[i].name.toUpperCase().trim());
        }
      })
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

    productId = parseInt(req.param('productId'));
    if (!productId) {
      return res.badRequest('Id del producto vacío');
    }

    //  user = req.user;
    user = {
      id: 1
    }

    return sequelize.transaction(function(t) {
        return Company.findAll({
            where: {
              userId: user.id
            },
            transaction: t
          })
          .then(function(company) {
            return company[0].getProducts({
              where: {
                code: code
              },
              transaction: t
            });
          })
          .then(function(products) {
            if (products.length == 0 || products[0].id == productId) {
              // Creación de las credenciales para crear un producto.
              productCredentials = {
                code: code,
                name: name,
                description: description,
                price: price,
                stateId: stateId,
                imageURI: "falsdf.com",
              }
              return Promise.all = [Product.findById(productId), Product.update(productCredentials, {
                where: {
                  id: productId
                },
                transaction: t
              })];
            }
            throw "Ya existe un producto con ese código";
          })
          .spread(function(product, amountProductsUpdated) {
            sails.log.debug(elements);
            if (elements.length >= 3) {
              elements.forEach(function(element, i, elementsList) {
                if (element.main == 'true') {
                  mainElement = element.id;
                } else {
                  elementsToSet.push(element.id);
                }
              })
              return Promise.all = [product, ElementData.findById(mainElement, {
                transaction: t
              })];
            } else {
              throw "No hay elementos";
            }
          })
          .spread(function(product, element) {
            element.ElementProduct = {
              main: true
            }
            elementsToSet.push(element);
            return product.setElementData(elementsToSet, {
              transaction: t
            })

          })
      })
      .then(function(result) {
        sails.log.debug(result[1]);
        res.ok(result[1]);
      })
      .catch(function(err) {
        sails.log.debug(err);
      })
  },
  /**
   * Función para eliminar un producto o servicio.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  delete: function(req, res) {
    // Declaración de variables.
    var productId = null;

    // Definición de las variables y validaciones.
    productId = parseInt(req.param('productId'));
    if (!productId) {
      return res.badRequest('Id del producto vacío');
    }

    // Se verifica que el producto exista, en caso de que exista se actualiza el campo enabled a false.
    Product.findById(productId)
      .then(function(product) {
        if (product) {
          return product.update({
            enabled: false
          })
        }
        throw "El producto no existe";
      })
      .then(function() {
        res.ok()
      })
      .catch(function(err) {
        res.serverError(err);
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

    // Definición de variables.
    user = req.user;

    Company.findAll({
        include: [{
          model: Product,
          include: [{
            model: ElementData,
            include: [{
              model: Element
            }]
          }]
        }],
        where: {
          userId: user.id
        }
      })
      .then(function(company) {
        sails.log.debug(company[0]);
        res.ok(company[0]);
      })
      .catch(function(err) {
        res.serverError(err);
      })
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
      where: {enabled: true},
      include: [
        {
          model: ElementData,
          include: [{model: Element},{model: ClientSupplier, where: {id: clientId}, required: false}]
        },
        {
          model: Company,
          where: {userId: user.id}
        }
      ],
      order: [[ElementData, Element, 'id', 'ASC']]
    })
    .then(function (products) {
      // products.forEach(function (product, index, productList) {
      //   ImageDataURIService.encode(path.resolve(sails.config.appPath + product.imageURI))
      //   .then((imageDataURI) => {
      //     product.imageURI = imageDataURI;
      //   })
      //   .catch((err) => {
      //     sails.log.debug(err)
      //   })
      // });
      // setTimeout(function() {return res.ok(products);}, 10);
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
        var numberProducts = products.length;
        products.forEach(function(product, index, productsList) {
          product.dataValues.type = 2;
          sails.log.debug(path.resolve(sails.config.appPath + product.imageURI))
          ImageDataURIService.encode(path.resolve(sails.config.appPath + product.imageURI))
            .then((imageDataURI) => {
              product.imageURI = imageDataURI;
            })
            .catch((err) => {
              sails.log.debug(err)
            })
        })
        setTimeout(function() {
          // sails.log.debug(products);
          res.ok(products);
        }, 10);
      })
      .catch(function(err) {
        sails.log.debug(err);
        res.serverError(err);
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
        products.forEach(function(product, index, productsList) {
          ImageDataURIService.encode(path.resolve(sails.config.appPath + product.imageURI))
            .then((imageDataURI) => {
              product.imageURI = imageDataURI;
            })
            .catch((err) => {
              sails.log.debug(err)
            })
        })
        setTimeout(function() {
          // sails.log.debug(products);
          res.ok(products);
        }, 10);
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
  }

};
