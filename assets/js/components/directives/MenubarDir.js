var arketops = angular.module('arketops');

arketops.directive('menubar', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/private/company/menubar.html',
    controller: 'menubarCtrl'
  }
})

arketops.controller('menubarCtrl', ['$scope', '$cookieStore', '$ngConfirm', 'AuthSvc', '$interval', 'AnchorSmoothScroll', '$location',
  function($scope, $cookieStore, $ngConfirm, AuthSvc, $interval, AnchorSmoothScroll, $location) {

    $scope.scrollUp = function () {
      AnchorSmoothScroll.scrollTo('navbar');
    }

    $scope.loadMyProfile = function () {
      AuthSvc.getMyNit()
      .then(function (res) {
        var nit = res.data.nit;
        $location.path('profile-info/' + nit)
      })
      .catch(function (err) {
        console.log(err);
      });
    }
  }
]);
