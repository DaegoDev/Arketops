var arketops = angular.module('arketops');

arketops.directive('productList', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/shared/product-list.html',
    scope: {
      products: '=',
      mode: '@'
    },
    controller: 'productListCtrl',
  }
})

arketops.controller('productListCtrl',
['$scope', '$log', '$ngConfirm', 'AuthSvc', '$state', 'StorageSvc', 'ProductSvc', productListCtrl]);

function productListCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc, ProductSvc) {

  //
  $scope.isPrivate = function () {
    return $scope.mode.toUpperCase() === 'OWNER';
  }

  //
  $scope.disable = function (product) {
    ProductSvc.delete(product.id)
    .then(function (res) {
      $scope.products.splice($scope.products.indexOf(product), 1);
    })
    .catch(function (err) {
      $log.log(err);
    });
  }
}
