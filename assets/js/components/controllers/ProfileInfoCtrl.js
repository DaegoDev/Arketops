var arketops = angular.module('arketops');
arketops.controller('ProfileInfoCtrl', ['$scope', '$log', '$ngConfirm', '$state', '$stateParams', 'ProductSvc', 'CompanySvc',
function($scope, $log, $ngConfirm, $state, $stateParams, ProductSvc, CompanySvc) {


  $scope.init = function () {
    var params = {companyNit: $stateParams.nit};
    $scope.otherHeadquarters = [];

    CompanySvc.getProfileInfo(params)
    .then(function (res) {
      $scope.company = res.data;

      $scope.company.Headquarters.forEach((headquarters, index, headquartersList) => {
        if (headquarters.main) {
          $scope.mainHeadquarters = headquarters;
        } else {
          $scope.otherHeadquarters.push(headquarters);
        }
      })

      return ProductSvc.getByCompany({companyId: $scope.company.id})
    })
    .then(function (res) {
      $scope.products = res.data;
    })
    .catch(function (err) {
      console.log(err);
    });
  }
  $scope.init();
  $scope.options = {
    mode: 'other'
  }

}]);
