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

  arketops.controller('resultCardCtrl', ['$scope', '$log', '$ngConfirm', 'AuthSvc', '$state', 'StorageSvc', 'CompanySvc', resultCardCtrl]);

  function resultCardCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc, CompanySvc) {

    if ($scope.type == 1) {
      $scope.isCompany = true;
    } else if ($scope.type == 2) {
      $scope.isProduct = true;
    }

    // Variable para verificar que el usuario esté autenticado.
    $scope.authenticated = AuthSvc.isAuthenticated();

    if ($scope.isCompany && $scope.authenticated) {
      // Verify if the company is supplier.
      CompanySvc.isSupplier({companyId: $scope.compProd.id})
      .then((res) => {
        if (!res.data) {
          $scope.followValue = 'Seguir';
          $scope.followStyle = {color: 'red'}
        }else {
          setFollowingValue();
        }
      })
      .catch((err) => {
        console.log(err);
      })
    }

    function setFollowingValue() {
      $scope.followValue = 'Siguiendo';
      $scope.followStyle = {color: 'blue'}
    }

    $scope.showProductsByCompany = function () {
      var companyToSend = JSON.stringify($scope.compProd);
      StorageSvc.set('companySelected', companyToSend, 'session');
      $state.go('productsByCompany');
    }

    $scope.showCompanyByProduct = function () {
      CompanySvc.getById({companyId: $scope.compProd.Company.id})
      .then((res) => {
        var companyToSend = JSON.stringify(res.data);
        StorageSvc.set('companySelected', companyToSend, 'session');
        $state.go('productsByCompany');
      })
      .catch((err) => {
        console.log(err);
      })
    }

    $scope.followCompany = function () {
      if ($scope.followValue == 'Siguiendo') {
        return;
      }
      CompanySvc.followCompany({supplierId: $scope.compProd.id})
      .then((res) => {
        setFollowingValue()
      })
      .catch((err) => {
        console.log(err);
      })
    }

  }
