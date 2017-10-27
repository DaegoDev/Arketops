var arketops = angular.module('arketops');
arketops.controller('PortfolioCtrl', ['$scope', '$log', '$state', '$stateParams',
'$ngConfirm', 'ProductSvc',
function($scope, $log, $state, $stateParams, $ngConfirm, ProductSvc) {

  ProductSvc.getMyPortfolio()
  .then(function (res) {
    console.log(res);
    $scope.portfolio = res.data;
  })
  .catch(function (err) {
    console.log(err);
  });

}]);
