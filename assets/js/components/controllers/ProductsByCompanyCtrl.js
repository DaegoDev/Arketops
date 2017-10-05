var arketops = angular.module('arketops');
arketops.controller('ProductsByCompanyCtrl', ['$scope', '$log', '$ngConfirm', '$state', '$stateParams', 'ProductSvc', 'StorageSvc',
  function($scope, $log, $ngConfirm, $state, $stateParams, ProductSvc, StorageSvc) {

    // Get the company stored in session
    $scope.company = JSON.parse(StorageSvc.get('companySelected', 'session'));
    // console.log($scope.company);

    ProductSvc.getByCompany({companyId: $scope.company.id})
    .then((res) => {
      console.log(res.data);
      $scope.products = res.data;
    })
    .catch((err) => {
      console.log(err);
    })

  }
]);
