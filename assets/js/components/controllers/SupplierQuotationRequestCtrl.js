var arketops = angular.module('arketops');
arketops.controller('SupplierQuotationRequestCtrl', ['$scope', '$filter', '$log', '$state', '$stateParams',
  '$ngConfirm', 'StorageSvc', 'QuotationSvc', 'ProductSvc', 'CompanySvc',
  function($scope, $filter, $log, $state, $stateParams, $ngConfirm, StorageSvc,QuotationSvc,
    ProductSvc, CompanySvc) {
    // Declaration of variables
    $scope.supplier = {};
    $scope.client = {}
    $scope.quotation = {};
    $scope.selectList = [];

    $scope.supplier = JSON.parse(StorageSvc.get('supplierSelected', 'session'));
    console.log($scope.supplier);

    CompanySvc.getProfile()
    .then((res) => {
      console.log(res.data);
      $scope.client = res.data;
      $scope.otherHeadquarters = [];
      $scope.client.Headquarters.forEach((headquarters, index, headquartersList) => {
        if (headquarters.main) {
          $scope.mainHeadquarters = headquarters;
        } else {
          $scope.otherHeadquarters.push(headquarters);
        }
      })
    })
    .catch((err) => {

    })

    $scope.today = $filter('date')(new Date(), "mediumDate");

    ProductSvc.getByCompany({
        companyId: $scope.supplier.id
      })
      .then((res) => {
        // console.log(res.data);
        $scope.products = res.data;
      })
      .catch((err) => {
        console.log(err);
      })


    $scope.showPortfolio = function() {
      $ngConfirm({
        title: 'Lista de productos del proveedor',
        contentUrl: 'templates/shared/load-product-table.html',
        scope: $scope,
        theme: 'modern',
        buttons: {
          removeAll: {
            text: 'Remover todo',
            btnClass: 'btn-red',
            action: function (scope, button) {
              $scope.selectList = [];
              $scope.removeMarkAdded();
              $scope.calculateTotal();
              $scope.$apply();
            }
          },
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-orange',
            action: function (scope, button) {

            }
          }
        }
      })
    }

    $scope.showResumeQuotation = function () {
      var supplierId = null;
      var products = [];
      var params = {};

      if ($scope.selectList.length == 0) {
        Materialize.toast('Debe seleccionar al menos un producto.', 4000, 'red darken-1 rounded');
        return;
      }

      supplierId = $scope.supplier.id;

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
          amount: $scope.selectList[i].amount
        }
        products.push(productToAdd);
      }

      params = {
        supplierId: supplierId,
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
            action: function (scope, button) {

            }
          },
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-orange',
            action: function (scope, button) {
              createQuotation(params)
            }
          }
        }
      })
    }

    function createQuotation (params) {
      if ($scope.quotation.loading) {
        return false;
      }

      $scope.quotation.loading = true;

      QuotationSvc.requestToSupplier(params)
        .then((res) => {
          console.log(res.data);
          $scope.quotation.loading = false;
          $ngConfirm({
            title: 'Cotización generada exitosamente',
            content: 'Se ha enviado la cotización generada a su correo electrónico y al de su proveedor.' +
            ' La cotización solo tendrá validez en el momento en que el proveedor la confirme.',
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
          $scope.calculateTotal();
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

    $scope.sumToTotal = function (subtotal) {
      $scope.total += subtotal;
    }

    $scope.calculateTotal = function () {
      var total = 0;
      $scope.selectList.forEach(function (product, index, selectList) {
        total += product.subtotal;
      })
      $scope.total = total;
    }

    $scope.calculateSubtotal = function (product) {
      console.log(product.amount);
      if (product.amount < 0 || isNaN(parseFloat(product.amount)) && !isFinite(product.amount)) {
        product.amount = 1;
      }
      if (product.amount != null) {
        if (product.amount.toString() == '0') {
          product.amount = 1;
        }
      }
      var priceWithTax = (product.amount * product.price) * ((product.tax.discount / 100) + 1);
      var discountPercent = (1 - (product.totalDiscount / 100))
      product.subtotal = priceWithTax * discountPercent;
      $scope.calculateTotal();
    }


    $scope.removeProductOfList = function(indexProductList, indexSelectList) {
      // console.log(indexProductList);
      $scope.selectList.splice(indexSelectList, 1);
      $scope.products[indexProductList].added = false;
      $scope.calculateTotal();
    }

    $scope.removeMarkAdded = function () {
      $scope.products.forEach(function (product) {
        product.added = false;
      })
    }


  }
]);
