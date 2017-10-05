var arketops = angular.module('arketops');
arketops.controller('SupplierDataCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'CompanySvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, CompanySvc, StorageSvc) {
    // Declaration of variables
    $scope.supplier = JSON.parse(StorageSvc.get('supplierSelected', 'session'));
    console.log($scope.supplier);
  }
]);
