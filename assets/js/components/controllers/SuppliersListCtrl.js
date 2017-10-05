var arketops = angular.module('arketops');
arketops.controller('SuppliersListCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'CompanySvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, CompanySvc) {
    // Variables needed
    $scope.suppliers = [];

    CompanySvc.getSuppliers()
    .then((res) => {
      $scope.suppliers = res.data;
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    })

    $scope.showDetails = function (supplier) {
      var supplierToSend = JSON.stringify(supplier);
      StorageSvc.set('supplierSelected', supplierToSend, 'session');
      $state.go('supplierDetails');
    }
  }
]);
