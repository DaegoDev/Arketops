var arketops = angular.module('arketops');
arketops.controller('SupplierDetailsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'CompanySvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, CompanySvc, StorageSvc) {
    // Declaration of variables
    $scope.supplier = JSON.parse(StorageSvc.get('supplierSelected', 'session'));

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
      name: 'Pedir cotización',
      selected: false
    }]

    $scope.goToState = function(option, index) {
      console.log($scope.lastOption);
      if (typeof $scope.lastOption == 'number') {
        var lastOption = $scope.lastOption;
        $scope.options[lastOption].selected = false;
      }
      $scope.lastOption = index;
      $scope.options[index].selected = true;
      if (option.toUpperCase() == 'DATOS PERSONALES') {
        $state.go('supplierDetails.personalData')
      } else if (option.toUpperCase() == 'PRODUCTOS') {
        $state.go('supplierDetails.products');
      } else if (option.toUpperCase() == 'DESCUENTOS') {
        $state.go('supplierDetails.discounts');
      } else if (option.toUpperCase() == 'COTIZACIONES') {
        $state.go('supplierDetails.quotationsList');
      } else if (option.toUpperCase() == 'PEDIR COTIZACIÓN') {
        $state.go('supplierDetails.quotationRequest');
      }
    }

    $scope.goToState('Datos personales', 0);
  }
]);
