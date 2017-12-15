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
    // Servicio para obtener una empresa dado su id.
    getById: function (params) {
      var company = $http({
        url: '/company/getById',
        method: 'GET',
        params: params
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
    },
    // Service to deactivate account.
    deactivateAccount: function () {
      var deactivated = $http({
        url: '/company/deactivateAccount',
        method: 'PUT',
      });
      return deactivated;
    },
    // Service to validate if a company is supplier.
    isSupplier: function (params) {
      var isSupplier = $http({
        url: '/company/validateSupplier',
        method: 'GET',
        params: params
      });
      return isSupplier;
    },
    // Service to follow a company.
    followCompany: function (params) {
      var follow = $http({
        url: '/company/followCompany',
        method: 'POST',
        data: params
      });
      return follow;
    },
    // Service to get the suppliers of a company.
    getSuppliers: function () {
      var suppliers = $http({
        url: '/company/getSuppliers',
        method: 'GET'
      });
      return suppliers;
    },
    // Service to get the clients of a company.
    getClients: function () {
      var clients = $http({
        url: '/company/getClients',
        method: 'GET'
      });
      return clients;
    },
    // Service to set a discount in an elementData to a client.
    setDiscountToClient: function (params) {
      var clientDiscount = $http({
        url: '/company/setDiscountToClient',
        method: 'POST',
        data: params
      });
      return clientDiscount;
    },
    // Service to update a discount in an elementData to a client.
    updateDiscountToClient: function (params) {
      var clientDiscount = $http({
        url: '/company/updateDiscountToClient',
        method: 'PUT',
        data: params
      });
      return clientDiscount;
    },
    // Service to delete a discount in an elementData to a client.
    deleteDiscountToClient: function (params) {
      var clientDiscount = $http({
        url: '/company/deleteDiscountToClient',
        method: 'DELETE',
        data: params
      });
      return clientDiscount;
    },

    // Service to get the profile info of a company using its email account.
    getProfileInfo: function (params) {
      var companyProfileInfo = $http({
        url: '/company/getByEmail',
        method: 'GET',
        params: params
      });
      return companyProfileInfo;
    }
  };
}]);
