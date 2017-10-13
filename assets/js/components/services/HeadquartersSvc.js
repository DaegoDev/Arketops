angular.module('arketops')
  .factory('HeadquartersSvc', ['$http',
    function($http) {
      return {
        // Service to create a company's headquarters.
        create: function (params) {
          var headquarters = $http({
            url: '/headquarters/create',
            method: 'POST',
            data: params
          });
          return headquarters;
        },
        // Service to update a company's headquarters.
        update: function (params) {
          var headquarters = $http({
            url: '/headquarters/update',
            method: 'PUT',
            data: params
          });
          return headquarters;
        },
        // Service to delete a company's headquarters.
        delete: function (params) {
          var headquarters = $http({
            url: '/headquarters/delete',
            method: 'DELETE',
            params: params
          });
          return headquarters;
        },
      };
    }
  ]);
