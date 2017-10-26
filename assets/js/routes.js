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
        url: '/profile',
        templateUrl: 'templates/private/company/company-profile.html',
        controller: 'CompanyProfileCtrl',
      })

      .state('recoverPassword', {
        url: '/recoverPassword',
        templateUrl: 'templates/private/company/recover-password.html',
        controller: 'RecoverPasswordCtrl'
      })

      .state('productsByCompany', {
        url: '/showProductsByCompany',
        templateUrl: 'templates/shared/products-by-company.html',
        controller: 'ProductsByCompanyCtrl'
      })

      .state('elements', {
        url: '/elementos',
        templateUrl: 'templates/private/company/elements.html',
        controller: 'ElementCtrl'
      })

      .state('productCreation', {
        url: '/product-create',
        templateUrl: 'templates/private/company/product-create.html',
        controller: 'ProductCtrl'
      })

      .state('portfolio', {
        url: '/portfolio',
        templateUrl: 'templates/private/company/portfolio.html',
        controller: 'PortfolioCtrl'
      })

      // Routes for supplier
      .state('suppliersList', {
        url: '/suppliers',
        templateUrl: 'templates/private/company/supplier/suppliers-list.html',
        controller: 'SuppliersListCtrl'
      })

      .state('supplierDetails', {
        url: '/supplierDetails',
        templateUrl: 'templates/private/company/supplier/supplier-details.html',
        controller: 'SupplierDetailsCtrl'
      })

      .state('supplierDetails.personalData', {
        url: '/supplierData',
        templateUrl: 'templates/private/company/supplier/supplier-data.html',
        controller: 'SupplierDataCtrl'
      })

      .state('supplierDetails.products', {
        url: '/supplierProducts',
        templateUrl: 'templates/private/company/supplier/supplier-products.html',
        controller: 'SupplierProductsCtrl'
      })

      .state('supplierDetails.discounts', {
        url: '/supplierDiscounts',
        templateUrl: 'templates/private/company/supplier/supplier-discounts.html',
        controller: 'SupplierDiscountsCtrl'
      })

      // Routes for client
      .state('clientsList', {
        url: '/clients',
        templateUrl: 'templates/private/company/client/clients-list.html',
        controller: 'ClientsListCtrl'
      })

      .state('clientDetails', {
        url: '/clientDetails',
        templateUrl: 'templates/private/company/client/client-details.html',
        controller: 'ClientDetailsCtrl'
      })

      .state('clientDetails.personalData', {
        url: '/clientData',
        templateUrl: 'templates/private/company/client/client-data.html',
        controller: 'ClientDataCtrl'
      })

      .state('clientDetails.products', {
        url: '/clientProducts',
        templateUrl: 'templates/private/company/client/client-products.html',
        controller: 'ClientProductsCtrl'
      })

      .state('clientDetails.discounts', {
        url: '/clientDiscounts',
        templateUrl: 'templates/private/company/client/client-discounts.html',
        controller: 'ClientDiscountsCtrl'
      })


  }]);
