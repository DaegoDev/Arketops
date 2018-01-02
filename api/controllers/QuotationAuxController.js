/**
 * QuotationAuxController
 *
 * @description :: Server-side logic for managing quotationauxes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var path = require('path');

module.exports = {
  /**
   * Función para hacer una cotización para un cliente no registrado.
   * @param  {Object} req Request object
   * @param  {Object} res Response object
   */

  createToUnregisteredClient: function(req, res) {
    // Declaración de variables.
    var user = null;
    var code = null;
    var date = null;
    var paymentFormId = null;
    var quotationValidityPeriod = null;
    var fileURI = null;

    // client variable.
    var clientName = null;
    var clientNit = null;
    var clientEmail = null;
    var clientPhonenumber = null;
    var clientCity = null;
    var clientNomenclature = null;
    var clientContact = null;
    var clientWebsite = null;

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

    paymentFormId = parseInt(req.param('paymentFormId'));
    if (!paymentFormId) {
      return res.badRequest('Forma de pago vacío');
    }

    clientName = req.param('clientName');
    if (!clientName) {
      return res.badRequest('Nombre del cliente vacío');
    }

    clientNit = req.param('clientNit');
    if (!clientNit) {
      return res.badRequest('NIT del cliente vacío');
    }

    clientEmail = req.param('clientEmail');
    if (!clientEmail) {
      return res.badRequest('Correo del cliente vacío');
    }

    clientPhonenumber = req.param('clientPhonenumber');
    if (!clientPhonenumber) {
      return res.badRequest('Teléfono del cliente vacío');
    }

    clientCity = req.param('clientCity');
    if (!clientCity) {
      return res.badRequest('Ciudad del cliente vacío');
    }

    clientNomenclature = req.param('clientNomenclature');
    if (!clientNomenclature) {
      return res.badRequest('Dirección del cliente vacío');
    }

    clientContact = req.param('clientContact');
    if (!clientContact) {
      return res.badRequest('Contacto del cliente vacío');
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

    relativeFilePath = '/resources/documents/quotations/confirmed/' + clientNit + "-" + date.getTime() + '.pdf';
    // Ruta donde se guarda el pdf de la cotización en el servidor.
    quotationFilePath = path.join(sails.config.appPath + relativeFilePath);

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
          return Promise.all = [QuotationAux.findAll({
              order: 'id DESC',
            }),
            PaymentForm.findById(paymentFormId)
          ];
        }
        throw "El usuario no existe"
      })
      .spread(function(lastCode, paymentForm) {
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
        client = {
					name: clientName,
					nit: clientNit,
					User: {
						email: clientEmail
					},
					Headquarters: [{
						city: clientCity,
						nomenclature: clientNomenclature,
						contact: clientContact,
						phonenumber: clientPhonenumber,
					}]
				};


        // Construye la configuración inicial para el documento.
        QuotationPDFService.builInitialConfig('LETTER', 20, 50, 20, 50);

        // Construye la primer sección con la información del proveedor.
        QuotationPDFService.buildContentSupplier(supplier, codePdf);

        // Construye la segunda sección con la información del cliente.
        QuotationPDFService.buildTableInfoClient(client, paymentForm, quotationValidityPeriod, date);

        return Promise.all = [supplier.hasProducts(addedProducts), Product.findAll({
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
        }), paymentForm]
      })
      .spread(function(productsValid, productsQuery, paymentForm) {
        if (!productsValid) {
          throw "Los productos no pertenecen al proveedor"
        }

        // Construye la tabla de productos para la cotización.
        QuotationPDFService.buildTableProducts(productsQuery, objectProduct);

        // Construye la ultima sección con información complementaria del proveedor.
        QuotationPDFService.buildComplementDataSupplier(supplier);

        // Credenciales para guardar la cotización en la bd.
        var quotationCredentials = {
          code: code,
          date: date,
          fileURI: relativeFilePath,
          quotationValidityPeriod: quotationValidityPeriod,
					clientNit: clientNit,
					clientEmail: clientEmail,
          paymentFormId: paymentForm.id,
					supplierId: supplier.id
        }

        return QuotationAux.create(quotationCredentials);

      })
      .then(function(quotation) {
        // Guarda el documento pdf en la ruta pasada como parametro.
        QuotationPDFService.saveDocument(quotationFilePath);
        MailService.sendQuotationToClient(supplier, client, quotationFilePath);
        MailService.sendQuotationToSupplier(supplier, client, quotationFilePath);
        res.created(quotation);
      })
      .catch(function(err) {
        res.serverError(err);
      })

  },

  getMyQuotations: function (req, res) {
    var user = req.user;

    QuotationAux.findAll({
      attributes: ['id', 'clientEmail', 'clientNit', 'code', 'date'],
      include: [
        {
          model: Company,
          attributes: ['id'],
          include: [
            {
              model: User,
              attributes: ['id'],
              where: {
                id: user.id
              }
            }
          ]
        }
      ]
    })
    .then(function (quotationList) {
      return res.ok(quotationList);
    })
    .catch(function (err) {
      return res.badRequest(err);
    });
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

    QuotationAux.findById(quotationId)
      .then((quotation) => {
        return res.sendfile(path.join(sails.config.appPath + quotation.fileURI));
      })
      .catch((err) => {
        return res.serverError(err);
      });
  },
};
