var arketops = angular.module('arketops');
arketops.controller('ProductsByCompanyCtrl', ['$scope', '$log', '$ngConfirm', '$state', '$stateParams', 'ProductSvc', 'StorageSvc',
  function($scope, $log, $ngConfirm, $state, $stateParams, ProductSvc, StorageSvc) {

    // Get the company stored in session
    $scope.company = JSON.parse(StorageSvc.get('companySelected', 'session'));
    console.log($scope.company);

    ProductSvc.getByCompany({companyId: $scope.company.id})
    .then((res) => {
      $scope.products = res.data;
      console.log(res.data);
    })
    .catch((err) => {

    })

  }
]);
