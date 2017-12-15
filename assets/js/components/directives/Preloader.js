var arketops = angular.module('arketops');

arketops.directive('preloader', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/shared/preloader.html',
    controller: 'preloaderCtrl'
  }
})

arketops.controller('preloaderCtrl', ['$scope', '$cookieStore',
  function($scope, $cookieStore,) {


  }
]);
