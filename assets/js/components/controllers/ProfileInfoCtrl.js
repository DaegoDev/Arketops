var arketops = angular.module('arketops');
arketops.controller('ProfileInfoCtrl', ['$scope', '$log', '$ngConfirm', '$state', '$stateParams', 'ProductSvc', 'CompanySvc', 'AuthSvc',
function($scope, $log, $ngConfirm, $state, $stateParams, ProductSvc, CompanySvc, AuthSvc) {
  $scope.options = {
    mode: 'other',
    isFollowing: true
  }

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

      // Checks if the user is logged in and then if is following the current user profile.
      $scope.authenticated = AuthSvc.isAuthenticated();
      if ($scope.authenticated) {
        CompanySvc.isSupplier({companyId: $scope.company.id})
        .then((res) => {
          if (!res.data) {
            $scope.options.isFollowing = false;
          } else {
            $scope.options.isFollowing = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });


  }
  $scope.init();

  $scope.followCompany = function () {
    if ($scope.options.isFollowing == true) {
      return;
    }

    CompanySvc.followCompany({supplierId: $scope.company.id})
    .then((res) => {
      if (!res.data) {
        $scope.options.isFollowing = false;
      } else {
        $scope.options.isFollowing = true;
      }
    })
    .catch((err) => {
      console.log(err);
    })
  }
}]);
