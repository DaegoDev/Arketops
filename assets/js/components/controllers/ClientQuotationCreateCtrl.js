var arketops = angular.module('arketops');
arketops.controller('ClientQuotationCreateCtrl', ['$scope', '$filter', '$log', '$state', '$stateParams',
  '$ngConfirm', 'StorageSvc', 'QuotationSvc', 'ProductSvc',
  function($scope, $filter, $log, $state, $stateParams, $ngConfirm, StorageSvc,
    QuotationSvc, ProductSvc) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));
    $scope.quotation = {};
    $scope.selectList = [];

    $scope.otherHeadquarters = [];
    $scope.client.Headquarters.forEach((headquarters, index, headquartersList) => {
      if (headquarters.main) {
        $scope.mainHeadquarters = headquarters;
      } else {
        $scope.otherHeadquarters.push(headquarters);
      }
    })

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

      })

    // Call the service to get my portfolio to quote to my client.
    ProductSvc.getMyPortfolioToQuote({
        clientId: $scope.client.ClientSupplier.id
      })
      .then((res) => {
        // console.log(res.data);
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
          cancel: {
            text: 'Cancelar',
            btnClass: 'btn-red'
          }
        }
      })
    }

    // Organize data and create a quotation.
    $scope.createQuotation = function() {
      var clientId = null;
      var quotationValidityPeriod = null;
      var paymentFormId = null;
      var paymentFormObject = null;
      var products = [];
      var params = {};

      if ($scope.selectList.length == 0) {
        Materialize.toast('Debe seleccionar al menos un producto.', 4000, 'red darken-1 rounded');
        return;
      }

      clientId = $scope.client.id;
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

      $scope.selectList.forEach(function(product, index, selectList) {
        var productToAdd = {
          id: product.id,
          amount: product.amount
        }
        products.push(productToAdd);
      })

      params = {
        clientId: clientId,
        quotationValidityPeriod: quotationValidityPeriod,
        paymentFormId: paymentFormId,
        products: products
      }

      QuotationSvc.createToClient(params)
        .then((res) => {
          console.log(res.data);
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
          // $scope.quotation.validityPeriod.selected = '';
          // $scope.quotation.paymentForms.selected = '';
          $scope.products.forEach(function (product) {
            product.added = false;
          })
        })
        .catch((err) => {
          console.log(err);
        })

    }

    $scope.total = 0;

    // Function to sum the subtotals of each product.
    $scope.sumToTotal = function (subtotal) {
      $scope.total += subtotal;
    }

    // Function to calculate the total in the quotation.
    $scope.calculateTotal = function () {
      var total = 0;
      $scope.selectList.forEach(function (product, index, selectList) {
        total += product.subtotal;
      })
      $scope.total = total;
    }

    // Calculate the subtotal for each product.
    $scope.calculateSubtotal = function (indexSelectList) {
      var product = $scope.selectList[indexSelectList];
      var priceWithTax = (product.amount * product.price) * ((product.tax.discount / 100) + 1);
      var discountPercent = (1 - (product.totalDiscount / 100))
      product.subtotal = priceWithTax * discountPercent;
      $scope.calculateTotal();
    }

    // Function to remove the products selected.
    $scope.removeProductOfList = function(indexProductList, indexSelectList) {
      // console.log(indexProductList);
      $scope.selectList.splice(indexSelectList, 1);
      $scope.products[indexProductList].added = false;
      $scope.calculateTotal();
    }


  }
]);
