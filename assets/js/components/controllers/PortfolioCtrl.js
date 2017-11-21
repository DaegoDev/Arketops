var arketops = angular.module('arketops');
arketops.controller('PortfolioCtrl', ['$scope', '$log', '$state', '$stateParams',
'$ngConfirm', 'ProductSvc',
function($scope, $log, $state, $stateParams, $ngConfirm, ProductSvc) {

  $scope.init = function () {
    ProductSvc.getMyPortfolio()
    .then(function (res) {
      $scope.portfolio = res.data;
    })
    .catch(function (err) {console.log(err);});

    $scope.options = {
      mode: 'OWNER'
    };
  }
  $scope.init();

}]);
