angular.module('arketops')
.factory('ElementSvc', ['$http', '$log',
function ($http, $log) {

  return {
    // Service to get all elements with their element data.
    getElements: function() {
      var elements = $http({
        url: '/element/getElements',
        method: 'GET'
      });
      return elements;
    },

    createElementData: function (elementData) {
      var credentials = {
        elementId: elementData.elementId,
        name: elementData.name,
        discount: elementData.discount
      };

      var create = $http({
        url: '/element/createElementData',
        method: 'POST',
        data: credentials
      });

      return create;
    }
  };
}]);
