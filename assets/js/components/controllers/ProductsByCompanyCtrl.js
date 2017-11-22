var arketops = angular.module('arketops');
arketops.controller('ProductsByCompanyCtrl', ['$scope', '$log', '$ngConfirm', '$state', '$stateParams', 'ProductSvc', 'StorageSvc',
  function($scope, $log, $ngConfirm, $state, $stateParams, ProductSvc, StorageSvc) {

    // Get the company stored in session
    $scope.company = JSON.parse(StorageSvc.get('companySelected', 'session'));
    // console.log($scope.company);
    $scope.otherHeadquarters = [];
    $scope.company.Headquarters.forEach((headquarters, index, headquartersList) => {
      if (headquarters.main) {
        $scope.mainHeadquarters = headquarters;
      } else {
        $scope.otherHeadquarters.push(headquarters);
      }
    })
    // console.log($scope.otherHeadquarters);

    ProductSvc.getByCompany({companyId: $scope.company.id})
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
