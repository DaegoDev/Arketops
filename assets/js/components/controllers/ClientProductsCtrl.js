var arketops = angular.module('arketops');
arketops.controller('ClientProductsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'ProductSvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, ProductSvc, StorageSvc) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));
    console.log($scope.client);

    ProductSvc.getByCompany({companyId: $scope.client.id})
    .then((res) => {
      $scope.products = res.data;
    })
    .catch((err) => {
      console.log(err);
    })
  }
]);
