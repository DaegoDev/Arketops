var arketops = angular.module('arketops');
arketops.controller('SupplierProductsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'ProductSvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, ProductSvc, StorageSvc) {
    // Declaration of variables
    $scope.supplier = JSON.parse(StorageSvc.get('supplierSelected', 'session'));
    // console.log($scope.supplier);

    ProductSvc.getByCompany({companyId: $scope.supplier.id})
    .then((res) => {
      console.log(res.data);
      $scope.products = res.data;
    })
    .catch((err) => {
      console.log(err);
    })

    $scope.options = {
      mode: 'other'
    }
  }
]);
