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
var cv2json = require('convert-json');
var node_xj = require("xls-to-json");
var excel = require('node-excel-export');
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
          },
          {
            model: State,
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
    for (var key in elementsDataDiscounts) {
      elementsDataDiscounts[key].forEach((elementData) => {
        elementDataIds.push(elementData.id);
      })
    }

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

        setTimeout(function() {
          res.sendfile(portfolioPathFile)
          setTimeout(function() {
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
        Company.findOne({
          where: {
            id: user.id
          }
        }),
        Product.findOne({
          where: {
            id: productId
          }
        })
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
        return product.update({
          imageURI: relativePath
        });
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
  /**
   * Función para cargar multiples productos desde un archivo.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  createProductsFromfile: function(req, res) {
    // Declaration of variables.
    var fileBase64 = null;
    var filePortfolio = null;
    var user = null;
    var relativePathFilePortfolio = null;
    var absolutePathFilePortfolio = null;
    var companyId = null;
    var stateDB = null;
    var products = {} // Products in the excel file.
    var productsNotAdded = []; // Products not added for restriction.
    var codes = [];


    fileBase64 = req.param('filePortfolio');
    if (!fileBase64) {
      return res.badRequest("Campo file vacío.");
    }

    user = req.user;
    relativePathFilePortfolio = '/resources/documents/portfolio/tmp/' + CriptoService.generateString(9) + '.xlsx';
    absolutePathFilePortfolio = sails.config.appPath + relativePathFilePortfolio;

    /**
     * Convert string base64 to file xlsx.
     */
    var bitmap = new Buffer(fileBase64, 'base64');
    // write buffer to file
    fs.writeFileSync(absolutePathFilePortfolio, bitmap);


    /**
     * Convert the excel file to JSON Object.
     */
    node_xj({
      input: absolutePathFilePortfolio, // input xls
      output: null, // output json
      sheet: "portafolio" // specific sheetname
    }, function(err, result) {
      if (err) {
        sails.log.error(err);
        return res.serverError(err);
      } else {
        // sails.log.debug(Object.keys(result[0]).length);
        if (Object.keys(result[0]).length == 0) {
          return res.serverError("Excel vacío");
        }
        // Organize the products array in an object.
        result.forEach((product, index, productList) => {
          !products[product.Código] ? products[product.Código] = {} : null;
          // Data concerning to a product.
          products[product.Código].productData = {
            code: product.Código,
            name: product.Nombre,
            description: product.Descripción,
            price: product.Precio,
          }
          // Data concerning to a product's state.
          products[product.Código].stateData = {
            name: product.Estado
          }
          // Data concerning to a product's elements.
          products[product.Código].elementsData = {
            1: product.Marca,
            2: product.Categoría,
            3: product.Línea,
            4: product.Impuesto
          }
          codes.push(product.Código);
        })

        // Get the company by user id.
        Company.findOne({
            where: {
              userId: user.id
            }
          })
          .then((company) => {
            companyId = company.id;
            // Get the products existing in the database.
            return Product.findAll({
              where: {
                code: codes,
                companyId: companyId,
                enabled: true
              }
            })
          })
          .then((productsDB) => {
            // If there are one or more products in the database is necessary update them.
            if (productsDB.length > 0) {
              var promisesUpdate = [];
              var promiseFunction = function(productDB, productExcel, index) {
                // Verify if the state with name present in excel exist in the database.
                return State.findOne({
                    where: {
                      name: {
                        $iLike: productExcel.stateData.name
                      }
                    }
                  })
                  .then((state) => {
                    if (!state) {
                      var productNotAdded = {
                        productCode: productExcel.productData.code,
                        errorCode: 2,
                        actionCode: 1,
                      }
                      productsNotAdded.push(productNotAdded);
                      throw new Error('Error disparado por estado al actualizar.');
                    }
                    stateDB = state;
                    return ElementData.findAll({
                      where: {
                        name: [productExcel.elementsData[1], productExcel.elementsData[2], productExcel.elementsData[3], productExcel.elementsData[4]]
                      }
                    })
                  })
                  .then((elementsData) => {
                    // Verify if the elements with name present in excel exist in the database.
                    var elementsIds = [];
                    var elementsDataIds = [];
                    var categoryElement = null;
                    var lineElement = null;
                    elementsData.forEach((elementData, index) => {
                      elementsIds.push(elementData.elementId);
                      elementsDataIds.push(elementData.id);
                      if (elementData.elementId == 2) {
                        categoryElement = elementData;
                      } else if (elementData.elementId == 3) {
                        lineElement = elementData;
                      }
                    })

                    var elementsNotAvailables = [];
                    for (var i = 1; i <= 4; i++) {
                      var index = elementsIds.indexOf(i);
                      if (index == -1 && productExcel.elementsData[i]) {
                        elementsNotAvailables.push(i);
                      }
                    }
                    // Add the products which the elements' names doesn't exist in the database.
                    if (elementsNotAvailables.length > 0) {
                      var productNotAdded = {
                        productCode: productDB.code,
                        elements: elementsNotAvailables,
                        errorCode: 1,
                        actionCode: 1,
                      }
                      productsNotAdded.push(productNotAdded);
                      throw new Error('Error disparado por elementos al actualizar.');
                    }

                    if (categoryElement && lineElement) {
                      return Promise.all = [categoryElement.hasElementChildren([lineElement.id]), elementsDataIds];
                    } else {
                      return Promise.all = [true, elementsDataIds];
                    }
                  })
                  .spread((isValidElementLink, elementsDataIds) => {
                    if (!isValidElementLink) {
                      var productNotAdded = {
                        productCode: productExcel.productData.code,
                        errorCode: 3,
                        actionCode: 1,
                      }
                      productsNotAdded.push(productNotAdded);
                      throw new Error('Error disparado por elementLink al actualizar.');
                    }
                    // Update data of the product and its state.
                    return Promise.all = [productDB.update(productExcel.productData), elementsDataIds, productDB.setState(stateDB.id)]
                  })
                  .spread((resultUpdate, elementsDataIds, stateUpdated) => {
                    // Update the elements of the product.
                    return productDB.setElementData(elementsDataIds);
                  })
                  .catch(function(err) {
                    sails.log.error(err);
                    // sails.log.debug('Catch error update');
                  });
              }

              productsDB.forEach(function(productDB, index) {
                var productExcel = products[productDB.code];
                delete products[productDB.code];
                promisesUpdate.push(promiseFunction(productDB, productExcel, index));

              });
              return promise.all(promisesUpdate);
            }

          })
          .then(() => {
            // If the products dont exist in the database is necessary create them.
            sails.log.debug(products);
            sails.log.debug(Object.keys(products).length != 0);
            if (Object.keys(products).length != 0) {
              var promisesCreate = [];
              var promiseFunction = function(productToCreate) {
                return State.findOne({
                    where: {
                      name: {
                        $iLike: productToCreate.stateData.name
                      }
                    }
                  })
                  .then((state) => {
                    if (!state) {
                      var productNotAdded = {
                        productCode: productToCreate.productData.code,
                        errorCode: 2,
                        actionCode: 2,
                      }
                      productsNotAdded.push(productNotAdded);
                      throw new Error('Error disparado por estado al crear.');
                    }
                    stateDB = state;
                    return ElementData.findAll({
                      where: {
                        name: [productToCreate.elementsData[1], productToCreate.elementsData[2], productToCreate.elementsData[3], productToCreate.elementsData[4]]
                      }
                    })
                  })
                  .then((elementsData) => {
                    var elementsIds = [];
                    var elementsDataIds = [];
                    var categoryElement = null;
                    var lineElement = null;

                    elementsData.forEach((elementData, index) => {
                      elementsIds.push(elementData.elementId);
                      elementsDataIds.push(elementData.id);
                      if (elementData.elementId == 2) {
                        categoryElement = elementData;
                      } else if (elementData.elementId == 3) {
                        lineElement = elementData;
                      }
                    })
                    var elementsNotAvailables = [];
                    for (var i = 1; i <= 4; i++) {
                      var index = elementsIds.indexOf(i);
                      if (index == -1 && productToCreate.elementsData[i]) {
                        elementsNotAvailables.push(i);
                      }
                    }
                    if (elementsNotAvailables.length > 0) {
                      var productNotAdded = {
                        productCode: productToCreate.productData.code,
                        elements: elementsNotAvailables,
                        errorCode: 1,
                        actionCode: 2,
                      }
                      productsNotAdded.push(productNotAdded);
                      throw new Error('Error disparado por elementos al crear.')
                    }
                    productToCreate.productData.companyId = companyId;
                    productToCreate.productData.stateId = stateDB.id;
                    if (categoryElement && lineElement) {
                      return Promise.all = [categoryElement.hasElementChildren([lineElement.id]), elementsDataIds];
                    } else {
                      return Promise.all = [true, elementsDataIds];
                    }
                  })
                  .spread((isValidElementLink, elementsDataIds) => {
                    if (!isValidElementLink) {
                      var productNotAdded = {
                        productCode: productToCreate.productData.code,
                        errorCode: 3,
                        actionCode: 2,
                      }
                      productsNotAdded.push(productNotAdded);
                      throw new Error('Error disparado por elementLink al crear.');
                    } else {
                      return Promise.all = [Product.create(productToCreate.productData), elementsDataIds]
                    }
                  })
                  .spread((productCreated, elementsDataIds) => {
                    return productCreated.setElementData(elementsDataIds);
                  })
                  .catch(function(err) {
                    sails.log.error(err);
                    // sails.log.debug('Catch error create');
                  });
              }

              for (var productToCreate in products) {
                if (products.hasOwnProperty(productToCreate)) {
                  promisesCreate.push(promiseFunction(products[productToCreate]));
                }
              }
              return promise.all(promisesCreate);
            }
          })
          .then((newProducts) => {
            if (absolutePathFilePortfolio) {
              fs.unlink(absolutePathFilePortfolio, (err2) => {
                if (err2) {
                  throw err2;
                }
                sails.log.debug('Se borró el archivo con portafolio.');
              });
            }
            sails.log.debug(productsNotAdded);
            res.ok(productsNotAdded);
          })
      }
    });
  },

};
