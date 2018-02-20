var arketops = angular.module('arketops');
arketops.controller('PortfolioCtrl', ['$scope', '$log', '$state', '$timeout', '$stateParams',
  '$ngConfirm', 'ProductSvc', 'ElementSvc', '$sce',
  function($scope, $log, $state, $timeout, $stateParams, $ngConfirm, ProductSvc, ElementSvc, $sce) {

    $scope.elementDataDiscounts = [];
    $scope.elementDataDiscountParam = {};

    $scope.init = function() {
      ProductSvc.getMyPortfolio()
        .then(function(res) {
          $scope.portfolio = res.data;
          console.log($scope.portfolio);
          $scope.options.isRequesting = false;

          // Prepare Excel data:
          $scope.fileName = "portafolio";
          $scope.portfolioToDownload = [];
          // Headers:
          $scope.portfolioToDownload.push(["Código", "Nombre", "Descripción", "Marca", "Categoría", "Línea", "Impuesto", "Estado", "Precio"]);
          // Data:
          angular.forEach($scope.portfolio, function(product, key) {
            var code = product.code;
            var name = product.name;
            var description = product.description;
            var trademark = product.ElementData[0] ? product.ElementData[0].name : '';
            var category = product.ElementData[1] ? product.ElementData[1].name : '';
            var line = product.ElementData[2] ? product.ElementData[2].name : '';
            var tax = product.ElementData[3] ? product.ElementData[3].name : '';
            var state = product.State.name;
            var price = product.price;
            $scope.portfolioToDownload.push([code, name, description, trademark, category, line, tax, state, price]);
          });
          // $scope.portfolioToDownload = [];
          // $scope.portfolio.forEach((product, index, portfolioList) => {
          //   console.log(product.code);
          //   var productToDownload = {
          //     code: product.code,
          //     name: product.name,
          //     description: product.description,
          //     trademark: product.ElementData[0] ? product.ElementData[0].name : '',
          //     category: product.ElementData[1] ? product.ElementData[1].name : '',
          //     line: product.ElementData[2] ? product.ElementData[2].name : '',
          //     tax: product.ElementData[3] ? product.ElementData[3].name : '',
          //     state: product.State.name,
          //     price: product.price,
          //   }
          //   $scope.portfolioToDownload.push(productToDownload);
          // })

        })
        .catch(function(err) {
          $scope.options.isRequesting = false;
          console.log(err);
        });

      $scope.options = {
        mode: 'OWNER',
        reload: function() {
          $scope.init();
        },
        isRequesting: true
      };
    }

    $scope.init();

    // Get all elements with the elementData corresponding.
    ElementSvc.getElements()
      .then((res) => {
        $scope.resElements = res.data;
        $scope.resElements.forEach(function(resElement, index, resList) {
          if (resElement.id == 4) {
            $scope.resElements.splice(index, 1)
          }
        })
        $scope.elements = {
          choices: $scope.resElements,
          selected: $scope.resElements[0]
        }
        $scope.getElementData($scope.elements.selected, 0)
      })
      .catch((err) => {
        console.log(err);
      })

    // Function to get the elementData of the elements Object.
    $scope.getElementData = function(value, indexDefault) {
      if (value.name.toUpperCase() === 'LÍNEA') {
        $scope.isLineSelected = true;
        var elementsLength = $scope.resElements.length
        for (var i = 0; i < elementsLength; i++) {
          console.log($scope.resElements[i]);
          if ($scope.resElements[i].name.toUpperCase() === 'CATEGORÍA') {
            $scope.categories = {
              choices: $scope.resElements[i].ElementData,
              selected: $scope.resElements[i].ElementData[0]
            }
            break;
          }
        }
        $scope.getLines($scope.categories.selected);
        return;
      }
      $scope.isLineSelected = false;
      $scope.elementData = {
        choices: value.ElementData,
        selected: value.ElementData[indexDefault]
      }
    }

    // Function to get the lines of a category.
    $scope.getLines = function(category) {
      $scope.elementData = {
        choices: category.ElementChildren,
        selected: category.ElementChildren[0]
      }
    }

    $scope.openFormToPrint = function() {
      $ngConfirm({
        title: 'Imprimir',
        contentUrl: '/templates/private/company/discounts-to-print.html',
        scope: $scope,
        type: 'orange',
        useBootstrap: false,
        width: '60%',
        theme: 'modern',
        backgroundDismiss: true,
        onDestroy: function() {
          $scope.elementDataDiscounts = [];
          $scope.elementDataDiscountParam = {};
        },
        buttons: {
          cancel: {
            text: 'Cancelar',
            btnClass: 'red',
            action: function(scope, button) {

            }
          },
          preview: {
            text: 'Generar catálogo',
            btnClass: 'btn-success',
            action: function(scope, button) {
              return $scope.generatePDFPreview();
            }
          }
        }
      })
    }

    // Add an elementData's discount to generate the portfolio in pdf.
    $scope.addDiscountToPrint = function() {
      // Variables
      var element = null;
      var elementData = null;
      var discount = null;
      var elementDataDiscount = null;

      elementData = $scope.elementData.selected;
      element = $scope.elements.selected;
      discount = $scope.discount;

      if (!elementData) {
        Materialize.toast('Debe seleccionar el valor del elemento', 4000, 'red darken-1 rounded');
        return;
      }

      elementDataDiscount = {
        id: elementData.id,
        name: elementData.name,
        elementId: element.id,
        elementName: element.name,
        discount: discount
      }

      $scope.elementDataDiscounts.push(elementDataDiscount);
      if (!$scope.elementDataDiscountParam[element.id]) {
        $scope.elementDataDiscountParam[element.id] = [];
      }
      $scope.elementDataDiscountParam[element.id].push(elementDataDiscount);

      $scope.discount = '';
    }

    // Remove an elementDataDiscount of the array shown to the user.
    $scope.removeDiscount = function(elementDataDiscount) {
      // Remove of the array shown in html.
      var index = $scope.elementDataDiscounts.indexOf(elementDataDiscount);
      $scope.elementDataDiscounts.splice(index, 1);
      // Remove of JSON param;
      var indexParam = $scope.elementDataDiscountParam[elementDataDiscount.elementId].indexOf(elementDataDiscount);
      $scope.elementDataDiscountParam[elementDataDiscount.elementId].splice(indexParam, 1);

    }

    $scope.generatePDFPreview = function() {
      $scope.options.isRequesting = true;
      ProductSvc.portfolioToPDF({
          elementsDataDiscounts: $scope.elementDataDiscountParam
        })
        .then(function(res) {
          $scope.options.isRequesting = false;
          var file = new Blob([res.data], {
            type: 'application/pdf'
          });
          var fileURL = URL.createObjectURL(file);
          $scope.pdfUrl = $sce.trustAsResourceUrl(fileURL);
          $ngConfirm({
            title: 'Portafolio',
            content: '<p>Desde esta ventana puede descargar el portafolio yendo a la barra de ' +
              'herramientas y seleccionando la opción "Download".</p>' +
              '<embed type="application/pdf" ng-src="{{pdfUrl}}" width="100%" height="600">',
            scope: $scope,
            theme: 'supervan',
          })

        })
        .catch(function(err) {
          console.log(err);
          $scope.options.isRequesting = false;
          $ngConfirm({
            title: 'Error',
            content: 'No se obtuvo ningún producto con los elementos seleccionados.',
            type: 'red',
            useBootstrap: false,
            width: '60%',
          })
        })
    }

    $scope.showUploadFileModal = function() {
      $ngConfirm({
        title: 'Cargar portafolio',
        contentUrl: '/templates/private/company/upload-portfolio-file.html',
        scope: $scope,
        type: 'orange',
        useBootstrap: false,
        width: '40%',
        theme: 'modern',
        backgroundDismiss: true,
        onDestroy: function() {

        },
        buttons: {
          cancel: {
            text: 'Cancelar',
            btnClass: 'red',
            action: function(scope, button) {

            }
          },
          accept: {
            text: 'Aceptar',
            btnClass: 'btn-success',
            action: function(scope, button) {
              return $scope.loadPortfolioFromFile();
            }
          }
        }
      })
    }

    // Función que se llama cuanto el archivo se carga.
    $scope.onLoadFile = function(e, reader, file, fileList, fileOjects, fileObj) {
      console.log(fileObj);
    };

    $scope.loadPortfolioFromFile = function() {
      var tmpFilePortfolio = $scope.filePortfolio;
      if (!tmpFilePortfolio) {
        return false;
      }

      $scope.options.isRequesting = true;
      ProductSvc.createProductsFromfile({
          filePortfolio: tmpFilePortfolio.base64
        })
        .then((res) => {
          console.log(res.data);
          $scope.productsWithIssues = res.data;
          $scope.options.isRequesting = false;
          $scope.init()
          if ($scope.productsWithIssues.length > 0) {
            $ngConfirm({
              title: 'Productos no actualizados ni creados.',
              contentUrl: '/templates/private/company/upload-issues-summary.html',
              scope: $scope,
              type: 'red',
              useBootstrap: false,
              width: '60%',
              theme: 'modern',
              backgroundDismiss: true,
              onDestroy: function() {

              },
              buttons: {
                accept: {
                  text: 'Aceptar',
                  btnClass: 'btn-success',
                  action: function(scope, button) {

                  }
                }
              }
            })
          } else {
            $ngConfirm({
              title: 'Proceso exitoso.',
              content: 'El portafolio se cargó correctamente.',
              type: 'orange',
              useBootstrap: false,
              width: '40%',
              theme: 'modern',
              backgroundDismiss: true,
              buttons: {
                accept: {
                  text: 'Aceptar',
                  btnClass: 'btn-success',
                  action: function(scope, button) {

                  }
                }
              }
            })
          }
        })
        .catch((err) => {
          $scope.options.isRequesting = false;
          $ngConfirm({
            title: 'Error: no se pudo cargar el portafolio',
            content: 'Ocurrio un problema interno al cargar el portafolio, intente más tarde.',
            type: 'red',
            useBootstrap: false,
            width: '40%',
            theme: 'modern',
            backgroundDismiss: true,
            buttons: {
              accept: {
                text: 'Aceptar',
                btnClass: 'btn-success',
                action: function(scope, button) {

                }
              }
            }
          })
        })
    }

  }
]);
