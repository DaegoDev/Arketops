var arketops = angular.module('arketops');
arketops.controller('ClientDetailsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'CompanySvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, CompanySvc, StorageSvc) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));

    $scope.options = [{
      name: 'Datos personales',
      selected: false
    }, {
      name: 'Productos',
      selected: false
    }, {
      name: 'Descuentos',
      selected: false
    }, {
      name: 'Cotizaciones',
      selected: false
    }, {
      name: 'Cotizar',
      selected: false
    }]

    $scope.goToState = function(option, index) {
      if (typeof $scope.lastOption == 'number') {
        var lastOption = $scope.lastOption;
        $scope.options[lastOption].selected = false;
      }
      $scope.lastOption = index;
      $scope.options[index].selected = true;
      if (option == 'Datos personales') {
        $state.go('clientDetails.personalData')
      } else if (option == 'Productos') {
        $state.go('clientDetails.products');
      } else if (option == 'Descuentos') {
        $state.go('clientDetails.discounts');
      } else if (option == 'Cotizaciones') {

      } else if (option == 'Cotizar') {
        $state.go('clientDetails.quotationCreate')
      }
    }

    $scope.goToState('Datos personales', 0);
  }
]);
