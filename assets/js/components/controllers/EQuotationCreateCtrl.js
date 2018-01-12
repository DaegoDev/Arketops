var arketops = angular.module('arketops');
arketops.controller('EQuotationCreateCtrl', ['$scope', '$filter', '$log', '$state', '$stateParams',
  '$ngConfirm', 'StorageSvc', 'QuotationSvc', 'ProductSvc', '$timeout',
  function($scope, $filter, $log, $state, $stateParams, $ngConfirm, StorageSvc,
    QuotationSvc, ProductSvc, $timeout) {
    // Declaration of variables

    $scope.quotation = {};
    $scope.selectList = [];
    $scope.client = {};
    $scope.mainHeadquarters = {};

    $scope.today = $filter('date')(new Date(), "mediumDate");
    // Function to create the Mont's day
    function buildDaysMonth() {
      $scope.daysMonth = [];
      for (var i = 1; i < 31; i++) {
        $scope.daysMonth.push(i);
      }
    }
    buildDaysMonth()

    // Validity of the quotation in days.
    $scope.quotation.validityPeriod = {
      choices: $scope.daysMonth,
    }

    // Call the service to get the payment forms.
    QuotationSvc.getPaymentforms()
      .then((res) => {
        $scope.quotation.paymentForms = {
          choices: res.data
        }
      })
      .catch((err) => {
        console.log(err);
      })

    // Call the service to get my portfolio to quote to my client.
    ProductSvc.getMyPortfolio()
      .then((res) => {
        $scope.products = res.data;
      })
      .catch((err) => {
        console.log(err);
      })

    // Open the modal with my portfolio.
    $scope.showPortfolio = function() {
      $ngConfirm({
        title: 'Lista de productos',
        contentUrl: 'templates/shared/load-product-table.html',
        scope: $scope,
        theme: 'modern',
        buttons: {
          removeAll: {
            text: 'Remover todo',
            btnClass: 'btn-red',
            action: function(scope, button) {
              $scope.selectList = [];
              $scope.removeMarkAdded();
              $scope.calculateTotal();
              $scope.$apply();
            }
          },
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-orange',
            action: function(scope, button) {

            }
          }
        }
      })
    }

    $scope.showResumeQuotation = function() {
      var clientId = null;
      var quotationValidityPeriod = null;
      var paymentFormId = null;
      var paymentFormObject = null;
      var products = [];
      var params = {};

      if (!$scope.client.nit) {
        Materialize.toast('Debe ingresar el nit del cliente.', 4000, 'red darken-1 rounded');
        return;
      }

      if (!$scope.client.name) {
        Materialize.toast('Debe ingresar el nombre de la empresa a la cual desea cotizar.', 4000, 'red darken-1 rounded');
        return;
      }

      if (!$scope.mainHeadquarters.contact) {
        Materialize.toast('Debe ingresar el nombre del contacto de la empresa.', 4000, 'red darken-1 rounded');
        return;
      }

      if (!$scope.client.email) {
        Materialize.toast('Debe ingresar el correo al cual desea enviar la cotización.', 4000, 'red darken-1 rounded');
        return;
      }

      if (!$scope.mainHeadquarters.nomenclature) {
        Materialize.toast('Debe ingresar la dirección de la empresa.', 4000, 'red darken-1 rounded');
        return;
      }
      if (!$scope.mainHeadquarters.city) {
        Materialize.toast('Debe ingresar la ciudad de la empresa.', 4000, 'red darken-1 rounded');
        return;
      }
      if (!$scope.mainHeadquarters.phonenumber) {
        Materialize.toast('Debe ingresar un número telefonico de contacto.', 4000, 'red darken-1 rounded');
        return;
      }

      if ($scope.selectList.length == 0) {
        Materialize.toast('Debe seleccionar al menos un producto.', 4000, 'red darken-1 rounded');
        return;
      }

      quotationValidityPeriod = $scope.quotation.validityPeriod.selected;
      paymentFormObject = $scope.quotation.paymentForms.selected;

      if (!quotationValidityPeriod) {
        Materialize.toast('Ingrese el tiempo de validez de la cotización.', 4000, 'red darken-1 rounded');
        return;
      }

      if (!paymentFormObject) {
        Materialize.toast('Ingrese la forma de pago.', 4000, 'red darken-1 rounded');
        return;
      }

      paymentFormId = paymentFormObject.id;

      var n = $scope.selectList.length;
      for (var i = 0; i < n; i++) {
        if (!$scope.selectList[i].amount) {
          $ngConfirm({
            title: 'Error',
            content: 'Debe ingresar al menos una cantidad en todos los productos.',
            type: 'red',
            boxWidth: '30%',
            useBootstrap: false,
            backgroundDismiss: true,
            buttons: {
              accept: {
                text: 'Aceptar'
              }
            }
          });
          return;
        }
        var productToAdd = {
          id: $scope.selectList[i].id,
          amount: $scope.selectList[i].amount,
          price: $scope.selectList[i].price
        }
        products.push(productToAdd);
      }

      params = {
        clientName: $scope.client.name,
        clientNit: $scope.client.nit,
        clientEmail: $scope.client.email,
        clientNomenclature: $scope.mainHeadquarters.nomenclature,
        clientCity: $scope.mainHeadquarters.city,
        clientPhonenumber: $scope.mainHeadquarters.phonenumber,
        clientContact: $scope.mainHeadquarters.contact,
        quotationValidityPeriod: quotationValidityPeriod,
        paymentFormId: paymentFormId,
        products: products
      }

      $ngConfirm({
        title: 'Resumen de la cotización',
        contentUrl: 'templates/private/company/resume-quotation.html',
        scope: $scope,
        theme: 'modern',
        boxWidth: '60%',
        useBootstrap: false,
        buttons: {
          cancel: {
            text: 'Cancelar',
            btnClass: 'btn-red',
            action: function(scope, button) {

            }
          },
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-orange',
            action: function(scope, button) {
              createQuotation(params)
            }
          }
        }
      })
    }

    function createQuotation(params) {
      if ($scope.quotation.loading) {
        return false;
      }

      $scope.quotation.loading = true;
      QuotationSvc.createToUnregisteredClient(params)
        .then((res) => {
          $scope.quotation.loading = false;
          $ngConfirm({
            title: 'Cotización creada exitosamente',
            content: 'Se ha enviado un correo electrónico al cliente con la cotización creada.',
            type: 'green',
            typeAnimated: true,
            boxWidth: '40%',
            useBootstrap: false,
            columnClass: 'medium',
            buttons: {
              accept: {
                text: 'Aceptar',
                btnClass: 'btn-green',
                action: function() {

                }
              }
            }
          });
          $scope.selectList = [];
          $scope.client = {};
          $scope.mainHeadquarters = {};
          $scope.quotation.validityPeriod.selected = null;
          $scope.quotation.paymentForms.selected = null;
          $scope.calculateTotal();
          // $scope.quotation.validityPeriod.selected = '';
          // $scope.quotation.paymentForms.selected = '';
          $scope.removeMarkAdded();
        })
        .catch((err) => {
          console.log(err);
          $scope.quotation.loading = false;
          $ngConfirm({
            title: 'Error',
            content: 'No se pudo generar la cotización. Intente más tarde.',
            type: 'red',
            boxWidth: '30%',
            useBootstrap: false,
            backgroundDismiss: true,
            buttons: {
              accept: {
                text: 'Aceptar'
              }
            }
          });
        })
    }

    $scope.total = 0;

    // Function to sum the subtotals of each product.
    // $scope.sumToTotal = function (subtotal) {
    //   $scope.total += subtotal;
    // }

    // Function to calculate the total in the quotation.
    $scope.calculateTotal = function() {
      var total = 0;
      $scope.selectList.forEach(function(product, index, selectList) {
        total += product.subtotal;
      })
      $scope.total = total;
    }

    // Function to calculate the subtotal in the quotation.
    $scope.calculateSubtotal = function(product) {
      if (product.amount < 0 || isNaN(parseFloat(product.amount)) && !isFinite(product.amount)) {
        product.amount = 1;
      }

      if (product.amount != null) {
        if (product.amount.toString() == '0') {
          product.amount = 1;
        }
      }

      var priceWithTax = (product.amount * product.price) * ((product.tax ? (product.tax.discount / 100) : 0) + 1);
      var discountPercent = (1 - (product.totalDiscount / 100))
      product.subtotal = priceWithTax * discountPercent;
      $scope.calculateTotal();
    }

    // Function to remove the products selected.
    $scope.removeProductOfList = function(indexProductList, indexSelectList) {
      $scope.selectList.splice(indexSelectList, 1);
      $scope.products[indexProductList].added = false;
      $scope.calculateTotal();
    }

    $scope.removeMarkAdded = function() {
      $scope.products.forEach(function(product) {
        product.added = false;
      })
    }

  }
]);
