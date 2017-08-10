var arketops = angular.module('arketops');
arketops.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'templates/public/content-home.html',
        controller: 'HomeCtrl'
      })


  }]);
