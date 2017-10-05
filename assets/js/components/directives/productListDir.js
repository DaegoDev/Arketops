var arketops = angular.module('arketops');

  arketops.directive('productList', function() {
    return {
      restric: 'E',
      templateUrl: 'templates/shared/product-list.html',
      scope: {
        products: '=',
      },
      controller: 'productListCtrl',
    }
  })

  arketops.controller('productListCtrl', ['$scope', '$log', '$ngConfirm', 'AuthSvc', '$state', 'StorageSvc', resultCardCtrl]);

  function resultCardCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc) {

    console.log($scope.products);
  }
