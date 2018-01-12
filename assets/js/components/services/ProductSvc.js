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

        // Servicio para eliminar un producto propio del usuario que llama el servicio.
        delete: function (productId) {
          productCredentials = {
            productId: productId
          };

          var product = $http({
            url: 'product/delete',
            method: 'DELETE',
            params: productCredentials
          });

          return product;
        },

        // Servicio que actualiza los datos de un producto de un cliente.
        update: function (credentials) {
          productCredentials = {
            productId: credentials.productId,
            code: credentials.code,
            name: credentials.name,
            description: credentials.description,
            price: credentials.price,
            stateId: credentials.stateId,
            elements: credentials.elements
          };

          var product = $http({
            url: '/product/update',
            method: 'PUT',
            data: productCredentials
          });
          return product;
        },

        // Servicio para obtener productos dado su nombre.
        getByName: function(params) {
          var products = $http({
            url: '/product/getByName',
            method: 'GET',
            params: params
          })
          .then(function (res) {
            data = res.data
            angular.forEach(data, function (product, key) {
              for (var i in product.ElementData) {
                if (product.ElementData[i].Element.id == 4) {
                  product.tax = product.ElementData[i];
                  break
                }
              }
            });
            return res;
          });
          return products;
        },

        //Service to get the products by company id.
        getByCompany: function(params) {
          var products = $http({
            url: '/product/getByCompany',
            method: 'GET',
            params: params
          })
          .then(function (res) {
            data = res.data
            angular.forEach(data, function (product, key) {
              for (var i in product.ElementData) {
                if (product.ElementData[i].Element.id == 4) {
                  product.tax = product.ElementData[i];
                  break
                }
              }
            });
            return res;
          });
          return products;
        },

        // Servicio para obtener todos los productos de la empresa.
        getMyPortfolio: function () {
          var portfolio = $http({
            url: '/product/getMyProducts',
            method: 'GET'
          })
          .then(function (res) {
            data = res.data
            angular.forEach(data, function (product, key) {
              for (var i in product.ElementData) {
                if (product.ElementData[i].Element.id == 4) {
                  product.tax = product.ElementData[i];
                  break
                }
              }
            });
            return res;
          });
          return portfolio;
        },

        // Servicio para obtener todos los productos con los descuentos para un cliente.
        getMyPortfolioToQuote: function (params) {
          var portfolio = $http({
            url: '/product/getMyProductsToQuote',
            method: 'GET',
            params: params
          });
          return portfolio;
        },

        getStates: function () {
          var states = $http({
            url: '/product/getStates',
            method: 'GET'
          });
          return states;
        },

        portfolioToPDF: function (params) {
          var portfolioPDFFile = $http({
            url: '/product/portfolioToPDF',
            method: 'PUT',
            params: params,
            responseType: 'arraybuffer'
          });
          return portfolioPDFFile;
        },

        updateImage: function (params) {
          var product = $http({
            url: '/product/updateImage',
            method: 'PUT',
            data: params
          });
          return product;
        }
      };
    }
  ]);
