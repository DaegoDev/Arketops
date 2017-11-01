var arketops = angular.module('arketops');
arketops.controller('ClientQuotationCreateCtrl', ['$scope', '$filter', '$log', '$state', '$stateParams',
  '$ngConfirm', 'StorageSvc', 'QuotationSvc', 'ProductSvc',
  function($scope, $filter, $log, $state, $stateParams, $ngConfirm, StorageSvc,
    QuotationSvc, ProductSvc) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));
    console.log($scope.client);
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

    ProductSvc.getMyPortfolioToQuote({
        clientId: $scope.client.ClientSupplier.id
      })
      .then((res) => {
        console.log(res.data);
        $scope.products = res.data;
      })
      .catch((err) => {
        console.log(err);
      })


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



  }
]);
