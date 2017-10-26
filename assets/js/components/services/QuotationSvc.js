angular.module('arketops')
  .factory('QuotationSvc', ['$http',
    function($http) {
      return {
        getPaymentforms: function () {
          var paymentForms = $http({
            url: '/quotation/getPaymentforms',
            method: 'GET',
          });
          return paymentForms;
        }
      };
    }
  ]);
