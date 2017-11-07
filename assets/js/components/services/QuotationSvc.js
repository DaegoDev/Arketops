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
        },
        createToClient: function (params) {
          var quotation = $http({
            url: '/quotation/createToClient',
            method: 'POST',
            data: params
          });
          return quotation;
        }
      };
    }
  ]);
