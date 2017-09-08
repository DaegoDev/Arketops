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
    // Servicio para obtener el perfil de una empresa.
    getProfile: function () {
      var company = $http({
        url: '/company/getProfile',
        method: 'GET'
      });
      return company;
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
    // Servicio para cambiar la contraseña de un usuario.
    updatePassword: function (params) {
      var pwsUpdated = $http({
        url: '/company/updatePassword',
        method: 'PUT',
        data: params
      });
      return pwsUpdated;
    },
    // Servicio para actualizar los datos de un usuario.
    updateData: function (params) {
      var updated = $http({
        url: '/company/updateData',
        method: 'PUT',
        data: params
      });
      return updated;
    },
    // Servicio para actualizar la imagen de perfil.
    updateImageProfile: function (params) {
      var updated = $http({
        url: '/company/updateImageProfile',
        method: 'PUT',
        data: params
      });
      return updated;
    }

  };
}]);
