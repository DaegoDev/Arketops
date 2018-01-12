/**
 * QuotationController
 *
 * @description :: Server-side logic for managing quotations
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Modulos requeridos.
var PdfPrinter = require('pdfmake/src/printer');
var watermark = require('image-watermark');
var fs = require('fs');
var path = require('path');
const Datauri = require('datauri');

module.exports = {
  /**
   * Función para hacer una cotización para un cliente.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  createToClient: function(req, res) {
    // Declaración de variables.
    var user = null;
    var code = null;
    var date = null;
    var clientId = null;
    var paymentFormId = null;
    var quotationValidityPeriod = null;
    var fileURI = null;
    var state = null;
    var products = [];
    var addedProducts = [];
    var objectProduct = {};
    var relativeFilePath = null;
    var quotationFilePath = null;
    var quotationCredentials = {};

    var supplier = null;
    var client = null;

    // Definición de variables y validaciones.
    quotationValidityPeriod = req.param('quotationValidityPeriod');
    if (!quotationValidityPeriod) {
      return res.badRequest('Periodo de validez vacío');
    }

    clientId = parseInt(req.param('clientId'));
    if (!clientId) {
      return res.badRequest('Id del cliente vacío');
    }

    paymentFormId = parseInt(req.param('paymentFormId'));
    if (!paymentFormId) {
      return res.badRequest('Forma de pago vacío');
    }

    products = req.param("products");
    if (products) {
      products.forEach(function(product, i, productsList) {
        objectProduct[product.id] = product;
        productsList[i] = product;
        index = addedProducts.indexOf(productsList[i].id);
        if (index != -1) {
          return res.badRequest({
            code: 2,
            msg: 'There are repeated products.'
          })
        } else {
          addedProducts.push(productsList[i].id);
        }
      })
    } else {
      return res.badRequest({
        code: 1,
        msg: 'There are no enough products'
      });
    }


    user = req.user;

    date = TimeZoneService.getDateNow({
      offset: -5
    }, null);

    relativeFilePath = '/resources/documents/quotations/confirmed/' + clientId + date.getTime() + '.pdf';
    // Ruta donde se guarda el pdf de la cotización en el servidor.
    quotationFilePath =  path.join(sails.config.appPath, relativeFilePath);

    // Se verifica que el usuario definido como proveedor exista. En caso de que exista se
    // es pasado a la variable supplier y se busca la vinculación con el cliente.
    Company.findOne({
        where: {
          userId: user.id
        },
        include: [{
          model: Headquarters,
          where: {
            main: true
          }
        }, {
          model: User,
          attributes: ['email']
        }]
      })
      .then(function(supplierRaw) {
        if (supplierRaw) {
          supplier = supplierRaw;
          // Obtiene y returna el enlace que hay entre proveedor y cliente.
          return ClientSupplier.findOne({
            where: {
              supplierId: supplier.id,
              clientId: clientId
            }
          });
        }
        throw "El usuario no existe"
      })
      .then(function(clientSupplier) {
        // Se verifica que el usuario marcado como cliente siga al usuario marcado como proveedor.
        if (clientSupplier) {
          // Se retorna el vinculo de cliente y proveedor, el cliente, el ultimo código de las
          // cotizaciones de un proveedor y la forma de pago.
          return Promise.all = [clientSupplier, Company.findById(clientId, {
            include: [{
              model: Headquarters,
              where: {
                main: true
              }
            }, {
              model: User,
              attributes: ['email']
            }]
          }), Quotation.findAll({
            order: 'id DESC',
            include: [{
              model: ClientSupplier,
              where: {
                supplierId: supplier.id
              }
            }]
          }), PaymentForm.findById(paymentFormId)];
        }
        throw "El usuario con id clientId no es cliente"
      })
      .spread(function(clientSupplier, clientRaw, lastCode, paymentForm) {
        // Se incrementa el último código.
        if (!lastCode[0]) {
          code = 1;
        } else {
          code = parseInt(lastCode[0].code) + 1;
        }
        // Formatea el código para llevarlo al pdf.
        var zeros = "00000";
        var codePdf = zeros.substring(0, zeros.length - code.toString().length) + code.toString();

        // Se asigna el cliente obtenido de la base de datos a la variable client.
        client = clientRaw;

        // Construye la configuración inicial para el documento.
        QuotationPDFService.builInitialConfig('LETTER', 20, 50, 20, 50);

        // Construye la primer sección con la información del proveedor.
        QuotationPDFService.buildContentSupplier(supplier, codePdf);

        // Construye la segunda sección con la información del cliente.
        QuotationPDFService.buildTableInfoClient(client, paymentForm, quotationValidityPeriod, date);

        return Promise.all = [clientSupplier, supplier.hasProducts(addedProducts), Product.findAll({
          where: {
            id: addedProducts
          },
          include: [{
            model: State
          }, {
            model: ElementData,
            include: [{
              model: Element,
            }]
          }]
        }), paymentForm, clientSupplier.getElementData()]
      })
      .spread(function(clientSupplier, productsValid, productsQuery, paymentForm, elementsDiscountClient) {
        if (!productsValid) {
          throw "Los productos no pertenecen al proveedor"
        }

        // Construye la tabla de productos para la cotización.
        QuotationPDFService.buildTableProducts(productsQuery, objectProduct, elementsDiscountClient);

        // Construye la ultima sección con información complementaria del proveedor.
        QuotationPDFService.buildComplementDataSupplier(supplier);

        // Credenciales para guardar la cotización en la bd.
        var quotationCredentials = {
          code: code,
          date: date,
          state: "creado",
          clientSupplierId: clientSupplier.id,
          fileURI: relativeFilePath,
          quotationValidityPeriod: quotationValidityPeriod,
          paymentFormId: paymentForm.id
        }
        return Quotation.create(quotationCredentials);

      })
      .then(function(quotation) {
        // Guarda el documento pdf en la ruta pasada como parametro.
        QuotationPDFService.saveDocument(quotationFilePath);
        MailService.sendQuotationToClient(supplier, client, quotationFilePath);
        MailService.sendQuotationToSupplier(supplier, client, quotationFilePath);
        res.created(quotation);
      })
      .catch(function(err) {
        sails.log.debug(err);
        res.serverError(err);
      })

  },
  /**
   * Función para solicitar la confirmación de una cotización a un proveedor.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  requestToSupplier: function(req, res) {
    // Declaración de variables.
    var user = null;
    var code = null;
    var date = null;
    var supplierId = null;
    var fileURI = null;
    var state = null;
    var products = [];
    var addedProducts = [];
    var objectProduct = {};
    var relativeFilePath = null;
    var quotationFilePath = null;

    var supplier = null;
    var client = null;

    supplierId = parseInt(req.param('supplierId'));
    if (!supplierId) {
      return res.badRequest('Id del proveedor vacío');
    }

    products = req.param("products");
    if (products) {
      products.forEach(function(product, i, productsList) {
        objectProduct[product.id] = product;
        productsList[i] = product;
        index = addedProducts.indexOf(productsList[i].id);
        if (index != -1) {
          return res.badRequest({
            code: 2,
            msg: 'There are repeated products.'
          })
        } else {
          addedProducts.push(productsList[i].id);
        }
      })
    } else {
      return res.badRequest({
        code: 1,
        msg: 'There are no enough products'
      });
    }

    user = req.user;

    date = TimeZoneService.getDateNow({
      offset: -5
    }, null);

    relativeFilePath = '/resources/documents/quotations/pending/' + date.getTime() + '.pdf';
    // Ruta donde se guarda el pdf de la cotización en el servidor.
    quotationFilePath = path.join(sails.config.appPath, relativeFilePath);

    // Se verifica que el cliente y proveedor existan. En caso de que exista
    // es pasado a la variable supplier y se busca la vinculación con el cliente.
    Company.findOne({
        where: {
          userId: user.id
        },
        include: [{
          model: Headquarters,
          where: {
            main: true
          }
        }, {
          model: User,
          attributes: ['email']
        }]
      })
      .then(function(clientRaw) {
        if (clientRaw) {
          client = clientRaw;
          // Obtiene y returna el enlace que hay entre proveedor y cliente.
          return ClientSupplier.findOne({
            where: {
              supplierId: supplierId,
              clientId: client.id
            }
          });
        }
        throw "El usuario no existe"
      })
      .then(function(clientSupplier) {
        // Se verifica que el usuario marcado como cliente siga al usuario marcado como proveedor.
        if (clientSupplier) {
          // Se retorna el vinculo de cliente y proveedor, el cliente, el ultimo código de las
          // cotizaciones de un proveedor y la forma de pago.
          return Promise.all = [clientSupplier, Company.findById(supplierId, {
            include: [{
              model: Headquarters,
              where: {
                main: true
              }
            }, {
              model: User,
              attributes: ['email']
            }]
          }), Quotation.findAll({
            order: 'id DESC',
            include: [{
              model: ClientSupplier,
              where: {
                supplierId: supplierId
              }
            }]
          })];
        }
        throw "El usuario con id clientId no es cliente"
      })
      .spread(function(clientSupplier, supplierRaw, lastCode) {
        if (!supplierRaw) {
          throw "El proveedor no existe"
        }
        // Se asigna el proveedor obtenido de la base de datos a la variable supplier.
        supplier = supplierRaw;

        // Se incrementa el último código.
        if (!lastCode[0]) {
          code = 1;
        } else {
          code = parseInt(lastCode[0].code) + 1;
        }
        // Formatea el código para llevarlo al pdf.
        var zeros = "00000";
        var codePdf = zeros.substring(0, zeros.length - code.toString().length) + code.toString();

        // Construye la configuración inicial para el documento.
        QuotationPDFService.builInitialConfig('LETTER', 20, 50, 20, 50);

        // Construye la primer sección con la información del proveedor.
        QuotationPDFService.buildContentSupplier(supplier, codePdf);

        // Construye la segunda sección con la información del cliente.
        QuotationPDFService.buildTableInfoClient(client, null, null, date);

        return Promise.all = [clientSupplier, supplier.hasProducts(addedProducts), Product.findAll({
          where: {
            id: addedProducts
          },
          include: [{
            model: State
          }, {
            model: ElementData,
            include: [{
              model: Element,
            }]
          }]
        }), clientSupplier.getElementData()]
      })
      .spread(function(clientSupplier, productsValid, productsQuery, elementsDiscountClient) {
        if (!productsValid) {
          throw "Los productos no pertenecen al proveedor"
        }
        // Construye la tabla de productos para la cotización.
        QuotationPDFService.buildTableProducts(productsQuery, objectProduct, elementsDiscountClient);

        // Construye la ultima sección con información complementaria del proveedor.
        QuotationPDFService.buildComplementDataSupplier(supplier);

        // Credenciales para guardar la cotización en la bd.
        var quotationCredentials = {
          code: code,
          date: date,
          state: "pendiente",
          clientSupplierId: clientSupplier.id,
          fileURI: relativeFilePath,
        }
        return Quotation.create(quotationCredentials);
      })
      .then(function(quotation) {
        // Guarda el documento pdf en la ruta pasada como parametro.
        QuotationPDFService.saveDocument(quotationFilePath);
        var tmpFilePath = quotationFilePath.replace("pending", "tmp");
        // var readStream = fs.createReadStream(sails.config.appPath + quotation.fileURI);
        // readStream.pipe(fs.createWriteStream(tmpFilePath));
        var options = {
          'text': 'SIN CONFIRMAR',
          'color': 'rgb(160, 162, 152)',
          'dstPath': tmpFilePath,
          'resize': '100%',
          'font': '/assets/fonts/ALGERIA.TTF'
        };
        sails.log.debug(quotationFilePath);
        sails.log.debug(tmpFilePath);
        sails.log.debug(options);
        setTimeout(function () {
          watermark.embedWatermarkWithCb(quotationFilePath, options, function() {
            sails.log.debug(quotationFilePath);
            sails.log.debug(tmpFilePath);

            MailService.sendQuotationToClient(supplier, client, tmpFilePath);
            MailService.sendQuotationToSupplier(supplier, client, tmpFilePath);

            setTimeout(function() {
              fs.unlink(tmpFilePath, (err) => {
                if (err) throw err;
                sails.log.debug('Se borró el archivo de pendiente');
              });
            }, 10000);

          });
        }, 5000);
        return res.created(quotation);
      })
      .catch(function(err) {
        res.serverError(err);
      })

  },
  /**
   * Función para confirmar una cotización de un cliente.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  confirmToClient: function(req, res) {
    // Declaración de variable.
    var quotationId = null;
    var paymentFormId = null;
    var quotationValidityPeriod = null;
    var fileToModify = null;
    var paymentForm = null;
    var relativeOutPath = null;

    // Definición de variables y validaciones.
    quotationId = parseInt(req.param('quotationId'));
    if (!quotationId) {
      return res.badRequest("Id de la cotización vacío");
    }
    quotationValidityPeriod = req.param('quotationValidityPeriod');
    if (!quotationValidityPeriod) {
      return res.badRequest('Periodo de validez vacío');
    }
    paymentFormId = parseInt(req.param('paymentFormId'));
    if (!paymentFormId) {
      return res.badRequest('Forma de pago vacío');
    }

    var fieldsToUpdate = {
      quotationValidityPeriod: quotationValidityPeriod,
      paymentFormId: paymentFormId,
      state: 'confirmado'
    }

    Quotation.findById(quotationId)
      .then((quotation) => {
        if (!quotation) {
          throw "Cotización no encontrada"
        }
        relativeOutPath = quotation.fileURI.replace("pending", "confirmed");
        fileToModify = path.join(sails.config.appPath, quotation.fileURI);
        return Promise.all = [quotation, PaymentForm.findById(paymentFormId)];
      })
      .spread((quotation, paymentFormRaw) => {
        if (!paymentFormRaw) {
          throw "No existe el registro de forma de pago";
        }
        paymentForm = paymentFormRaw;
        fieldsToUpdate.fileURI = relativeOutPath;
        return quotation.update(fieldsToUpdate);
      })
      .then((quotationsUpdated) => {
        if (quotationsUpdated == 0) {
          throw "No se actualizó ningún registro";
        }
        // QuotationPDFService.modify(fileToModify);
        QuotationPDFService.modify(fileToModify, quotationValidityPeriod, paymentForm.name);
        return Quotation.findById(quotationId);
      })
      .then((quotation) => {
        res.ok(quotation);
      })
      .catch((err) => {
        res.serverError(err);
      })
  },

  /**
   * Function to get the payment forms for a quotation.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getPaymentforms: function(req, res) {
    PaymentForm.findAll()
      .then((paymentForms) => {
        res.ok(paymentForms)
      })
      .catch((err) => {
        sails.log.debug(err)
        res.serverError()
      })
  },

  /**
   * Function to get the quotations registered with a client supplier id.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */

  getByClientSupplierId: function(req, res) {
    // Variables
    var clientSupplierId = null;
    var created = [];
    var requested = [];
    var response = {};

    // Definition of the variables.
    clientSupplierId = parseInt(req.param("clientSupplierId"));
    if (!clientSupplierId) {
      return res.badRequest('Client supplier id required');
    }

    Quotation.findAll({
        include: [{
          model: PaymentForm
        }],
        where: {
          clientSupplierId: clientSupplierId,
        }
      })
      .then((quotations) => {
        if (quotations.length == 0) {
          return res.serverError('Quotations not found');
        }

        quotations.forEach((quotation, index, quotationsList) => {
          //  quotation.fileURI = new Uint8Array(fs.readFileSync(sails.config.appPath + quotation.fileURI));
          // quotation.fileURI = fs.readFileSync(sails.config.appPath + quotation.fileURI);
          if (quotation.state.toUpperCase() === 'CREADO') {
            created.push(quotation);
          } else {
            requested.push(quotation);
          }
        })
        response.created = created;
        response.requested = requested;
        res.ok(response);
        // response = new Uint8Array(fs.readFileSync(sails.config.appPath + quotations[0].fileURI));
        // response = new Datauri(sails.config.appPath + quotations[0].fileURI);
        // sails.log.debug(response);
        // res.ok(response)
        // res.sendfile(sails.config.appPath + quotations[0].fileURI);
      })
      .catch((err) => {
        sails.log.error(err)
        res.serverError()
      })

  },

  /**
   * Function to get a quotation file.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */
  getQuotationFile: function(req, res) {
    var quotationId = null;

    quotationId = parseInt(req.param('quotationId'));
    if (!quotationId) {
      return res.badRequest('Quotation id required.')
    }

    Quotation.findById(quotationId)
      .then((quotation) => {
        sails.log.debug("GETQUOTATIONFILE");
        if (quotation.state.toUpperCase() === 'PENDIENTE') {
          var tmpRelativePath = quotation.fileURI.replace("pending", "tmp");
          var tmpFilePath = path.join(sails.config.appPath, tmpRelativePath);
          var imagePath = path.join(sails.config.appPath, quotation.fileURI);
          // var readStream = fs.createReadStream(path.join(sails.config.appPath + quotation.fileURI));
          // readStream.pipe(fs.createWriteStream(tmpFilePath));
          var options = {
            'text': 'SIN CONFIRMAR',
            'color': 'rgb(160, 162, 152)',
            'dstPath': tmpFilePath,
            'resize': '100%',
            'font': '/assets/fonts/ALGERIA.TTF'
          };
          watermark.embedWatermarkWithCb(imagePath, options, function() {
            res.sendfile(tmpFilePath)
            setTimeout(function() {
              fs.unlink(tmpFilePath, (err) => {
                if (err) throw err;
                sails.log.debug('Se borró el archivo de pendiente');
              });
            }, 500);
          });
        } else {
          res.sendfile(path.join(sails.config.appPath, quotation.fileURI));
        }

      })
      .catch(function (err) {
        return res.serverError(err);
      });
  },


};
