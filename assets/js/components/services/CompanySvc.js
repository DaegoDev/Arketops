angular.module('arketops')
.factory('CompanySvc', ['$http', '$rootScope',
function ($http, $rootScope) {

  return {
    // Servicio para registrar una empresa.
    signup: function(credentials) {
      var signup = $http({
        url: '/company/signup',
        method: 'POST',
        data: credentials
      });
      return signup;
    },
    // Servicio para obtener una empresa dado su nombre.
    getByName: function (params) {
      var companies = $http({
        url: '/company/getByName',
        method: 'GET',
        params: params
      });
      return companies;
    },
    // Servicio para obtener empresas y productos dado una palabra clave.
    getCompaniesAndProducts: function (params) {
      var result = $http({
        url: '/company/searchAll',
        method: 'GET',
        params: params
      });
      return result;
    },

  };
}]);
