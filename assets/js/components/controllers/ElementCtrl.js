var arketops = angular.module('arketops');
arketops.controller('ElementCtrl', ['$scope', '$log', '$state', '$stateParams',
'$ngConfirm', '$timeout', 'ElementSvc',
function($scope, $log, $state, $stateParams, $ngConfirm, $timeout, ElementSvc) {
  const CREATE = 1;
  const UPDATE = 2;

  // Controller variables inicialization
  $scope.init = function () {
    $scope.elementType = null;
    $scope.selectedElement = null;
    $scope.parentElement = null;
    $scope.elementData = {};
    $scope.mode = CREATE;

    $scope.showElement = false;

    ElementSvc.getElementsByUser()
    .then(function (res) {$scope.elements = res.data;})
    .catch(function (err) {$log.debug(err);});
  }

  $scope.init();

  $scope.selectElement = function (element) {
    $scope.mode = CREATE;
    $scope.elementData = {};
    $scope.showElement = false;
    $timeout(function() {
      $scope.elementType = element.name.toUpperCase();
      $scope.selectedElement = element;

      if ($scope.elementType == 'LINEA') {
        for (var i in $scope.elements) {
          if ($scope.elements[i].name.toUpperCase() == 'CATEGORIA') {
            $scope.parentElement = $scope.elements[i];
          }
        }
      }

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

  // Function to create a new data element which is linked to another data element.
  $scope.createLinkedElementData = function () {
    // Here we set the required parameter values for de data element.
    var elementData = {
      elementId: $scope.selectedElement.id,
      name: $scope.elementData.name,
      discount: $scope.elementData.discount,
      dataParentId: $scope.dataParent.id
    }

    // Call the linked data element create service and save it into both the element
    // data list and the parent children when created.
    ElementSvc.createLinkedElementData(elementData)
    .then(function (res) {
      $scope.selectedElement.ElementData.push(res.data);
      $scope.elementData = {};
    })
    .catch(function (err) {$log.debug(err)});
  }


  $scope.selectElementData = function (elementData) {
    $scope.mode = UPDATE;
    $scope.elementData = {
      name: elementData.name,
      discount: elementData.discount,
      id: elementData.id,
    }
  }

  $scope.exitUpdate = function () {
    $scope.mode = CREATE;
    $scope.elementData = {};
  }
}
]);
