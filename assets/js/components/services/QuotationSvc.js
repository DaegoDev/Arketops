angular.module('arketops')
  .factory('QuotationSvc', ['$http',
    function($http) {
      return {
        // Service to get the payment forms for a quotations.
        getPaymentforms: function () {
          var paymentForms = $http({
            url: '/quotation/getPaymentforms',
            method: 'GET',
          });
          return paymentForms;
        },
        // Service to create a quotation for a client.
        createToClient: function (params) {
          var quotation = $http({
            url: '/quotation/createToClient',
            method: 'POST',
            data: params
          });
          return quotation;
        },
        // Service to request a quotation to a supplier.
        requestToSupplier: function (params) {
          var quotation = $http({
            url: '/quotation/requestToSupplier',
            method: 'POST',
            data: params
          });
          return quotation;
        },
      };
    }
  ]);
