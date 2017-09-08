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

  arketops.controller('resultCardCtrl', ['$scope', '$log', '$ngConfirm', 'AuthSvc', resultCardCtrl]);

  function resultCardCtrl($scope, $log, $ngConfirm, AuthSvc) {

    console.log($scope.compProd);

    if ($scope.type == 1) {
      $scope.isCompany = true;
    } else if ($scope.type == 2) {
      $scope.isProduct = true;
    }

    // Variable para verificar que el usuario esté autenticado.
    $scope.authenticated = AuthSvc.isAuthenticated();

  }
