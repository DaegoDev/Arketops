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

    // Service to get all elements of a specific user with their element data.
    getElementsByUser: function () {
      var elements = $http({
        url: '/element/getElementsByUser',
        method: 'POST'
      });
      return elements;
    },

    // Service to get all elements discount by client.
    getElementsDiscountByClient: function(params) {
      console.log(params);
      var elements = $http({
        url: '/element/getElementsDiscountByClient',
        method: 'GET',
        params: params
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
    },

    createLinkedElementData: function (elementData) {
      var credentials = {
        elementId: elementData.elementId,
        name: elementData.name,
        discount: elementData.discount,
        dataParentId: elementData.dataParentId
      };

      var create = $http({
        url: '/element/createLinkedElementData',
        method: 'POST',
        data: credentials
      });

      return create;
    }
  };
}]);
