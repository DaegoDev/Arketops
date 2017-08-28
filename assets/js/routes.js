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

      .state('showResults', {
        url: '/empresasProductos',
        templateUrl: 'templates/shared/result-list.html',
        controller: 'ResultListCtrl',
        params: {
          searchValue: null,
          filter: null
        },
      })


  }]);
