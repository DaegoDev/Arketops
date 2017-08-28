var arketops = angular.module('arketops');

arketops.directive('menubar', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/private/company/menubar.html',
    controller: 'menubarCtrl'
  }
})

arketops.controller('menubarCtrl', ['$scope', '$cookieStore', '$ngConfirm', 'AuthSvc', '$interval', function($scope, $cookieStore, $ngConfirm, AuthSvc, $interval) {



}]);
