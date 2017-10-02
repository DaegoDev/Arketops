angular.module('arketops')
  .factory('ProductSvc', ['$http',
    function($http) {
      return {
        create: function (credentials) {
          productCredentials = {
            code: credentials.code,
            name: credentials.name,
            description: credentials.description,
            price: credentials.price,
            stateId: credentials.stateId,
            imageDataURI: credentials.imageDataURI,
            elements: credentials.elements
          };

          var product = $http({
            url: '/product/create',
            method: 'POST',
            data: productCredentials
          });
          return product;
        },

        // Servicio para obtener productos dado su nombre.
        getByName: function (params) {
          var products = $http({
            url: '/product/getByName',
            method: 'GET',
            params: params
          });
          return products;
        }

      };
    }
  ]);
