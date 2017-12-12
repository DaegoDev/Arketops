/**
 *  Librerias utilizadas para la cración de la cotización en formato pdf.
 */
var PdfPrinter = require('pdfmake/src/printer');
var watermark = require('image-watermark');
var fs = require('fs');
var hummus = require('hummus');

// Variable que guarda el contenido del pdf.
var docDefinition = {};

module.exports = {

  /**
   * Función para construir la configuración inicial del documento pdf con el footer.
   * @param  {String} pageSize Tamaño del documento pdf.
   * @param  {number} marginLeft Margen izquierda del documento pdf.
   * @param  {number} marginTop Margen superior del documento pdf.
   * @param  {number} marginRigth Margen derecha del documento pdf.
   * @param  {number} marginBottom Margen inferior del documento pdf.
   */
  builInitialConfig: function(pageSize, marginLeft, marginTop, marginRigth, marginBottom) {
    docDefinition.pageSize = pageSize;
    docDefinition.pageMargins = [marginLeft, marginTop, marginRigth, marginBottom];
    docDefinition.content = [];
    docDefinition.styles = {};
    docDefinition.footer = {
      columns: [{
          image: sails.config.appPath + "/assets/images/logoFooter.png",
          width: 40,
          height: 40,
          margin: [340, 0, 0, 0]
        },
        {
          text: 'Copyright ® 2014 Arketops',
          style: 'footer'
        }
      ],
      columnGap: 6,
    };
    docDefinition.styles.footer = {
      fontSize: 8,
      margin: [200, 14, 0, 0]
    }
  },
  /**
   * Función para construir la primera sección de la cotización con la información del proveedor.
   * @param  {Object} supplier Información del proveedor.
   * @param  {String} codePdf Código que llevará la cotización.
   */
  buildContentSupplier: function(supplier, codePdf) {
    var firstSection = [{
        columns: [{
            image: sails.config.appPath + supplier.imageURI,
            width: 110,
            height: 90,
          },
          {
            width: '*',
            height: 'auto',
            text: [{
                text: supplier.name.toUpperCase() + '\n',
                style: 'title'
              },
              {
                text: supplier.businessOverview,
                style: 'description',
              }
            ]
          },
          {
            width: '15%',
            style: 'tableExample',
            table: {
              body: [
                ['Cotización'],
                [{
                  text: codePdf,
                  alignment: 'center'
                }]
              ]
            }
          }
        ],
        // Espacio entre las columnas.
        columnGap: 10
      },
      {
        canvas: [{
          type: 'line',
          x1: 0,
          y1: 5,
          x2: 600 - 2 * 40,
          y2: 5,
          lineWidth: 1
        }]
      }
    ];
    // Estilo para la primera sección.
    docDefinition.styles.title = {
      fontSize: 18,
      bold: true,
      alignment: 'center',
      margin: [110, -50]
    };
    docDefinition.styles.description = {
      fontSize: 10,
      alignment: 'justify',
    }
    docDefinition.styles.tableExample = {
      margin: [0, 5, 0, 15]
    }
    // Se añade al contenido del documento.
    docDefinition.content.push(firstSection);
  },
  /**
   * Función para construir la segunda sección del documento pdf con el con la información del cliente.
   * @param  {Object} client Contiene la información del cliente.
   * @param  {Object} paymentForm Contiene la información de la forma de pago.
   * @param  {String} quotationValidityPeriod Valor del periodo de validez de la cotización.
   * @param  {Date} date Fecha en que se crea la cotización.
   */
  buildTableInfoClient: function(client, paymentForm, quotationValidityPeriod, date) {
    var secondSection = [{
      style: 'tableInfoClient',
      table: {
        widths: ['12%', '31%', '31%', '15%', '12%'],
        headerRows: 1,
        body: [
          [{
            text: 'NIT',
            style: 'tableHeader'
          }, {
            text: 'CLIENTE',
            style: 'tableHeader',
          }, {
            text: 'CONTACTO',
            style: 'tableHeader'
          }, {
            text: 'TELÉFONO',
            style: 'tableHeader'
          }, {
            text: 'FECHA',
            style: 'tableHeader'
          }],
          [{
            text: client.nit,
            style: 'tableBody'
          }, {
            text: client.name,
            style: 'tableBody'
          }, {
            text: client.Headquarters[0].contact,
            style: 'tableBody'
          }, {
            text: client.Headquarters[0].phonenumber,
            style: 'tableBody'
          }, {
            text: date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(),
            style: 'tableBody'
          }],
          [{
            text: 'CIUDAD',
            style: 'tableHeader'
          }, {
            text: 'DIRECCIÓN',
            style: 'tableHeader',
          }, {
            text: 'EMAIL',
            style: 'tableHeader'
          }, {
            text: 'TIPO DE PAGO',
            style: 'tableHeader'
          }, {
            text: 'VALIDEZ',
            style: 'tableHeader'
          }],
          [{
            text: client.Headquarters[0].city,
            style: 'tableBody'
          }, {
            text: client.Headquarters[0].nomenclature,
            style: 'tableBody'
          }, {
            text: client.User.email,
            style: 'tableBody'
          }, {
            text: paymentForm ? paymentForm.name : "",
            style: 'tableBody'
          }, {
            text: quotationValidityPeriod ? quotationValidityPeriod + " días" : "",
            style: 'tableBody'
          }]
        ]
      },
      layout: {
        fillColor: function(i, node) {
          return (i % 2 === 0) ? '#FFFF00' : null;
        }
      },
    }];
    // Se añade stilo a la tabla con la información del cliente.
    docDefinition.styles.tableHeader = {
      bold: true,
      fontSize: 10,
      color: 'black',
      alignment: 'center'
    }
    docDefinition.styles.tableBody = {
      fontSize: 9,
      alignment: 'center'
    }
    docDefinition.styles.tableInfoClient = {
      margin: [0, 20, 10, 15]
    }
    // Se añade al contenido del documento.
    docDefinition.content.push(secondSection);
  },

  /**
   * Función para construir la tercera sección de la cotización con la información de los productos.
   * @param  {Object} productsQuery Contiene la información de los productos obtenida de la base de datos.
   * @param  {Object} objectProduct Contiene la información de los productos ingresada por el usuario, como cantidad a cotizar.
   */
  buildTableProducts: function(productsQuery, objectProduct, elementsDiscountClient) {
    var thirdSection = [{
      style: 'tableProducts',
      table: {
        widths: ['5,5%', '8,5%', '23%', '12%', '15%', '12,5%', '12%', '14%'],
        headerRows: 1,
        body: createTableBodyProducts(productsQuery, objectProduct, elementsDiscountClient),
      },
      layout: {
        fillColor: function(i, node) {
          return (i === 0) ? '#FFFF00' : null;
        }
      },
    }];
    // Se añade estilo a la tabla de productos.
    docDefinition.styles.tableProducts = {
        margin: [0, 20, 10, 15]
      },
      docDefinition.content.push(thirdSection);
  },
  /**
   * Función para construir la cuarta sección de la cotización con información del proveedor.
   * @param  {Object} supplier Contiene la información del proveedor.
   */
  buildComplementDataSupplier: function(supplier) {
    var fourthSection = [{
        text: [{
            text: 'ATENTAMENTE: ',
            style: 'subTitle'
          },
          {
            text: supplier.name,
            style: 'supplierData'
          }
        ]
      },
      {
        text: [{
            text: 'DIRECCIÓN: ',
            style: 'subTitle'
          },
          {
            text: supplier.Headquarters[0].nomenclature,
            style: 'supplierData'
          }
        ]
      }, {
        text: [{
            text: 'TELÉFONO: ',
            style: 'subTitle'
          },
          {
            text: supplier.Headquarters[0].phonenumber,
            style: 'supplierData'
          }
        ]
      }, {
        text: [{
            text: 'SITIO WEB: ',
            style: 'subTitle'
          },
          {
            text: supplier.website,
            style: 'supplierData'
          }
        ]
      }
    ];
    // Se añade estilo para la cuarta sección.
    docDefinition.styles.subTitle = {
      bold: true,
      fontSize: 10,
      color: 'black',
      alignment: 'left'
    }
    docDefinition.styles.supplierData = {
      fontSize: 9
    }
    docDefinition.content.push(fourthSection);
  },
  /**
   * Función para guardar el documento pdf en la ruta pasada como parametro.
   * @param  {String} quotationFilePath Ruta donde se guardará el documento.
   */
  saveDocument: function(quotationFilePath, quotationValidityPeriod, paymentForm) {
    // Fuentas usadas para construir el pdf.
    var fonts = {
      Roboto: {
        normal: sails.config.appPath + '/assets/fonts/Roboto-Regular.ttf',
        bold: sails.config.appPath + '/assets/fonts/Roboto-Medium.ttf',
        italics: sails.config.appPath + '/assets/fonts/Roboto-Italic.ttf',
        bolditalics: sails.config.appPath + '/assets/fonts/Roboto-MediumItalic.ttf'
      }
    };

    // Instancia para crear el pdf de la cotización.
    var printer = new PdfPrinter(fonts);

    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(quotationFilePath));
    pdfDoc.end();
  },
  /**
   * Función para editar el documento pdf y agregarle el periodo de valides y el tipo de pago.
   * @param  {String} quotationFilePath Ruta donde se guardará el documento.
   * @param  {String} quotationValidityPeriod Periodo de validez de la cotización.
   * @param  {String} paymentForm Tipo de pago para la cotización.
   */
  modify: function(quotationFilePath, quotationValidityPeriod, paymentForm) {
    var inStream = new hummus.PDFRStreamForFile(quotationFilePath);
    var outputPath = quotationFilePath.replace("pending", "confirmed");
    var outStream = new hummus.PDFWStreamForFile(outputPath);

    var pdfWriter = hummus.createWriterToModify(inStream, outStream);
    var pageModifier = new hummus.PDFPageModifier(pdfWriter, 0);

    var context = pageModifier.startContext().getContext();
    sails.log.debug(context);
    context.cm(1, 0, 0, -1, 0, 792);
    context.writeText(paymentForm, 455, 560, {
      font: pdfWriter.getFontForFile(sails.config.appPath + '/assets/fonts/arial.ttf'),
      size: 10,
      colorspace: 'gray',
      color: 0x00
    });
    context.writeText(quotationValidityPeriod + " días", 535, 560, {
      font: pdfWriter.getFontForFile(sails.config.appPath + '/assets/fonts/arial.ttf'),
      size: 10,
      colorspace: 'gray',
      color: 0x00
    });
    pageModifier.endContext().writePage();

    pdfWriter.end();
    outStream.close();
    inStream.close();
    fs.unlink(quotationFilePath, (err) => {
      if (err) throw err;
      sails.log.debug('Se borró el archivo de pendiente');
    });
  },

}

/**
 * Función para construir el cuerpo de la tabla de los productos a cotizar.
 * @param  {Object} productsQuery Contiene la información de los productos obtenida de la base de datos.
 * @param  {Object} objectProduct Contiene la información de los productos ingresada por el usuario, como cantidad a cotizar.
 */
function createTableBodyProducts(productsQuery, objectProduct, elementsDiscountClient) {
  var totalQuotation = 0;
  var elementsDiscountLenght = elementsDiscountClient.length
  var contentTableProducts = [
    [{
      text: 'ITEM',
      style: 'tableHeader'
    }, {
      text: 'CÓDIGO',
      style: 'tableHeader'
    }, {
      text: 'DESCRIPCIÓN',
      style: 'tableHeader'
    }, {
      text: 'CANTIDAD',
      style: 'tableHeader',
    }, {
      text: 'VR. UNITARIO',
      style: 'tableHeader'
    }, {
      text: 'DESCUENTO',
      style: 'tableHeader'
    }, {
      text: 'IMPUESTO',
      style: 'tableHeader'
    }, {
      text: 'TOTAL',
      style: 'tableHeader'
    }]
  ];
  // sails.log.debug(productsQuery)
  // Products to quote gotten of the db
  productsQuery.forEach(function(product, index, productsList) {
    var elementData = product.ElementData;
    var amountElements = elementData.length;
    var discount = 0;
    var trademark = null;
    var amount = null;
    var price = null;
    var taxName = null;
    var taxValue = null;
    var total = null;
    var mainFound = false;
    var isSpecialDiscount = false;
    var discountsList = [];
    var indexElementMain = null;
    var specialDiscount = 0;

    // sails.log.debug(elementsDiscountClient)
    for (var i = 0; i < amountElements; i++) {
      var isSpecialDiscount = false;
      if (elementData[i].Element.name.toUpperCase() == "MARCA") {
        trademark = elementData[i].name;
      } else if (elementData[i].Element.name.toUpperCase() == "IMPUESTO") {
        taxName = elementData[i].name;
        taxValue = elementData[i].discount;
        continue;
      }
      for (var j = 0; j < elementsDiscountLenght; j++) {
        if (elementData[i].id === elementsDiscountClient[j].id) {
          specialDiscount = elementsDiscountClient[j].ClientDiscount.discount;
          isSpecialDiscount = true;
          // isDiscountClient = true;
          break;
        }
      }

      if (isSpecialDiscount) {
        discount += specialDiscount;
      } else {
        discount += elementData[i].discount;
      }

      // if (!mainFound && !especialDiscount) {
      //   if (elementData[i].ElementProduct.main) {
      //     indexElementMain = i;
      //     discount = elementData[i].discount;
      //     mainFound = true;
      //   }
      //   if (!isDiscountClient) {
      //     discountsList[i] = elementData[i].discount;
      //     discount += elementData[i].discount;
      //   }
      // }else if (true) {
      //
      // }

    }
    // sails.log.debug(discount);
    amount = objectProduct[product.id].amount;
    price = product.price;
    var tmpTotal = price * amount;
    var totalWithDiscount = tmpTotal - (tmpTotal * (discount / 100));
    var total = totalWithDiscount * (1 + (taxValue / 100));
    totalQuotation += total;
    var productToPdf = [{
      text: index + 1,
      style: 'tableBody'
    }, {
      text: product.code,
      style: 'tableBody'
    }, {
      text: product.name + " " + trademark,
      style: 'tableBody'
    }, {
      text: amount,
      style: 'tableBody'
    }, {
      text: '$ ' + price.toLocaleString(),
      style: 'tableBody'
    }, {
      text: discount + "%",
      style: 'tableBody'
    }, {
      text: taxName + " " + taxValue + "%",
      style: 'tableBody'
    }, {
      text: "$ " + total.toLocaleString(),
      style: 'tableBody'
    }];
    contentTableProducts.push(productToPdf);
  })
  var lastColumn = [{
    text: "",
    colSpan: 6
  }, {}, {}, {}, {}, {}, {
    text: "Total",
    style: 'tableBody'
  }, {
    text: "$ " + totalQuotation.toLocaleString(),
    style: 'tableBody'
  }]
  contentTableProducts.push(lastColumn);
  return contentTableProducts;
}
