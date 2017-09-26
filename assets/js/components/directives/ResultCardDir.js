var arketops = angular.module('arketops');

  arketops.directive('resultCard', function() {
    return {
      restric: 'E',
      templateUrl: 'templates/shared/result-card.html',
      scope: {
        compProd: '=',
        type: '@',
      },
      controller: 'resultCardCtrl',
    }
  })

  arketops.controller('resultCardCtrl', ['$scope', '$log', '$ngConfirm', 'AuthSvc', '$state', 'StorageSvc', resultCardCtrl]);

  function resultCardCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc) {

    // console.log($scope.compProd);

    if ($scope.type == 1) {
      $scope.isCompany = true;
    } else if ($scope.type == 2) {
      $scope.isProduct = true;
    }

    // Variable para verificar que el usuario esté autenticado.
    $scope.authenticated = AuthSvc.isAuthenticated();

    $scope.showProductsByCompany = function () {
      var companyToSend = JSON.stringify($scope.compProd);
      StorageSvc.set('companySelected', companyToSend, 'session');
      $state.go('productsByCompany');
    }

  }
