/**
 *  Librerias utilizadas para la cración del portafolio en formato pdf.
 */
var PdfPrinter = require('pdfmake/src/printer');
var fs = require('fs');

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
  buildContentSupplier: function(supplier) {
    // sails.log.debug(supplier)
    var firstSection = [{
        columns: [{
            image: sails.config.appPath + supplier.imageURI,
            width: 100,
            height: 80,
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
          x2: 600 - 1 * 40,
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
    // Se añade al contenido del documento.
    docDefinition.content.push(firstSection);
  },

  /**
   * Función para construir la tercera sección de la cotización con la información de los productos.
   * @param  {Object} productsQuery Contiene la información de los productos obtenida de la base de datos.
   * @param  {Object} objectProduct Contiene la información de los productos ingresada por el usuario, como cantidad a cotizar.
   */
  buildTableProducts: function(productsQuery, elementsDataDiscounts) {
    var thirdSection = [{
        text: 'Portafolio',
        style: 'portfolioTitle'
      },
      {
        style: 'tableProducts',
        table: {
          widths: ['10%', '25%', '14%', '14%', '10%', '14%', '14%'],
          headerRows: 1,
          body: createTableBodyProducts(productsQuery, elementsDataDiscounts),
        },
        layout: {
          fillColor: function(i, node) {
            return (i === 0) ? '#FFFF00' : null;
          }
        },
      }
    ];
    // Se añade estilo a la tabla de productos.
    docDefinition.styles.tableProducts = {
      margin: [0, 20, 10, 15]
    }
    docDefinition.styles.portfolioTitle = {
      fontSize: 18,
      bold: true,
      alignment: 'center',
      margin: [0, 20, 0, -10]
    };
    docDefinition.content.push(thirdSection);
  },

  /**
   * Función para guardar el documento pdf en la ruta pasada como parametro.
   * @param  {String} quotationFilePath Ruta donde se guardará el documento.
   */
  saveDocument: function(portfolioFilePath) {
    // Fuentas usadas para construir el pdf.
    var fonts = {
      Roboto: {
        normal: sails.config.appPath + '/assets/fonts/Roboto-Regular.ttf',
        bold: sails.config.appPath + '/assets/fonts/Roboto-Medium.ttf',
        italics: sails.config.appPath + '/assets/fonts/Roboto-Italic.ttf',
        bolditalics: sails.config.appPath + '/assets/fonts/Roboto-MediumItalic.ttf'
      }
    };

    // Instancia para crear el pdf del portfolio.
    var printer = new PdfPrinter(fonts);
    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(portfolioFilePath));
    pdfDoc.end();
  },
}

/**
 * Función para construir el cuerpo de la tabla de los productos a cotizar.
 * @param  {Object} productsQuery Contiene la información de los productos obtenida de la base de datos.
 * @param  {Object} objectProduct Contiene la información de los productos ingresada por el usuario, como cantidad a cotizar.
 */
function createTableBodyProducts(productsQuery, elementsDataDiscounts) {
  var elementsDataDiscountsObject = JSON.parse(elementsDataDiscounts);
  var objectDiscountsEmpty = _.isEmpty(elementsDataDiscountsObject);
  sails.log.debug(elementsDataDiscountsObject);
  var contentTableProducts = [
    [{
      text: 'CÓDIGO',
      style: 'tableHeader'
    }, {
      text: 'DESCRIPCIÓN',
      style: 'tableHeader'
    }, {
      text: 'MARCA',
      style: 'tableHeader'
    }, {
      text: 'PRECIO',
      style: 'tableHeader'
    }, {
      text: 'DESC.',
      style: 'tableHeader'
    }, {
      text: 'IMPUESTO',
      style: 'tableHeader'
    }, {
      text: 'TOTAL',
      style: 'tableHeader'
    }]
  ];

  // Products to list in pdf file.
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

    // sails.log.debug(elementData);
    for (var i = 0; i < amountElements; i++) {

      if (elementData[i].Element.name.toUpperCase() == "MARCA") {
        trademark = elementData[i].name;
      } else if (elementData[i].Element.name.toUpperCase() == "IMPUESTO") {
        taxName = elementData[i].name;
        taxValue = elementData[i].discount;
        continue;
      }
      // console.log(_.isEmpty(JSON.parse(elementsDataDiscounts)));

      if (!objectDiscountsEmpty) {
        // console.log(elementData[i]);
        var elementDataDiscount = elementsDataDiscountsObject[elementData[i].elementId];
        // console.log(elementDataDiscount);

        if (elementDataDiscount) {
          var elementDataDiscountLength = elementDataDiscount.length

          for (var j = 0; j < elementDataDiscountLength; j++) {
            if (elementData[i].id == elementDataDiscount[j].id) {
              discount += elementDataDiscount[j].discount;
            }
          }
        }

      }

    }

    // sails.log.debug(discount);
    price = product.price;
    var totalWithDiscount = price - (price * (discount / 100));
    var total = totalWithDiscount * (1 + (taxValue / 100));

    var productToPdf = [{
      text: product.code,
      style: 'tableBodyCenter'
    }, {
      text: product.name,
      style: 'tableBody'
    }, {
      text: trademark ? trademark : "",
      style: 'tableBody'
    }, {
      text: '$ ' + price.toLocaleString(),
      style: 'tableBodyCenter'
    }, {
      text: discount + "%",
      style: 'tableBodyCenter'
    }, {
      text: taxName ? taxName + " " + taxValue + "%" : "0" + "%",
      style: 'tableBodyCenter'
    }, {
      text: "$ " + total.toLocaleString(),
      style: 'tableBodyCenter'
    }];

    docDefinition.styles.tableBodyCenter = {
      fontSize: 9,
      alignment: 'center',
    };
    docDefinition.styles.tableBody = {
      fontSize: 9,
    };
    docDefinition.styles.tableHeader = {
      fontSize: 10,
      bold: true,
      alignment: 'center',
    };
    contentTableProducts.push(productToPdf);
  })

  return contentTableProducts;
}

// function isEmpty(obj) {
//   for (var key in obj) {
//     // console.log(obj.hasOwnProperty(key));
//     if (obj.hasOwnProperty(key))
//       return false;
//   }
//   return true;
// }
