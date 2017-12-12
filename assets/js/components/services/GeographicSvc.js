angular.module('arketops')
  .factory('GeographicSvc', ['$http',
    function($http) {
      return {
        // Service to get countries by continent.
        getCountriesByContinent: function() {
          var countries = $http({
            url: 'https://restcountries.eu/rest/v2/all',
            method: 'GET',
          });
          return countries;
        },
        // Service to get department, states by country.
        getDepartmentsByCountry: function (params) {
          var departments = $http({
            url: '//api.geonames.org/searchJSON',
            method: 'GET',
            params: params
          });
          return departments;
        },
        // Service to get cities by department.
        getCitiesByDepartment: function (params) {
          var cities = $http({
            url: '//api.geonames.org/searchJSON',
            method: 'GET',
            params: params
          });
          return cities;
        }

      };
    }
  ]);
