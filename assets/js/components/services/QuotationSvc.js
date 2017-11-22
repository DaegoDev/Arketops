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
        // Service to get the quotations by client supplier id.
        getByClientSupplierId: function (params) {
          var quotations = $http({
            url: '/quotation/getByClientSupplierId',
            method: 'GET',
            params: params,
          });
          return quotations;
        },
        // Service to get the file of the corresponding quotation.
        getQuotationFile: function (params) {
          var quotationFile = $http({
            url: '/quotation/getQuotationFile',
            method: 'GET',
            params: params,
            responseType: 'arraybuffer'
          });
          return quotationFile;
        },
        // Service to confirm a quotation requested.
        confirmToClient: function (params) {
          var confirmed = $http({
            url: '/quotation/confirmToClient',
            method: 'PUT',
            data: params,
          });
          return confirmed;
        }
      };
    }
  ]);
