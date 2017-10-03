var arketops = angular.module('arketops');
arketops.controller('ElementCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', '$timeout', 'ElementSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, $timeout, ElementSvc) {
    // Controller variables inicialization
    $scope.init = function() {
      $scope.selectedElement = null;
      $scope.elementData = {};
      $scope.showElement = false;

      ElementSvc.getElements()
        .then(function(res) {
          console.log(res.data);
          $scope.elements = res.data;
        })
        .catch(function(err) {
          $log.debug(err);
        });
    }

    $scope.init();

    $scope.selectElement = function(element) {
      $scope.showElement = false;
      $timeout(function() {
        $scope.selectedElement = element;
        $scope.showElement = true;
      }, 1000 * 0.3);

    }

    // Function to create a new data element.
    $scope.createElementData = function() {
      // Here we set the required parameter values for de data element.
      var elementData = {
        elementId: $scope.selectedElement.id,
        name: $scope.elementData.name,
        discount: $scope.elementData.discount
      }

      // Call the data element create service and save it into the element data list
      // when created.
      ElementSvc.createElementData(elementData)
        .then(function(res) {
          $scope.selectedElement.ElementData.push(res.data);
          $scope.elementData = {};
        })
        .catch(function(err) {
          $log.debug(err)
        });
    }


    $scope.disableElementData = function(elementData) {
      $scope.selectedElement.ElementData.splice($scope.selectedElement.ElementData.indexOf(elementData), 1);
    }
  }
]);
