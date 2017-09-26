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

      .state('companyProfile', {
        url: '/perfil',
        templateUrl: 'templates/private/company/company-profile.html',
        controller: 'CompanyProfileCtrl',
      })

      .state('recoverPassword', {
        url: '/recoverPassword',
        templateUrl: 'templates/private/company/recover-password.html',
        controller: 'RecoverPasswordCtrl'
      })

      .state('elements', {
        url: '/elementos',
        templateUrl: 'templates/private/company/elements.html',
        controller: 'ElementCtrl'
      })



  }]);
