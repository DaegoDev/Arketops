var arketops = angular.module('arketops');
arketops.controller('ElementCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', '$timeout', 'ElementSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, $timeout, ElementSvc) {

    // Baked relations between parent and child elements.
    var linkRelations = [
      {parent: "CATEGORÍA", child: "LÍNEA", parentRef: null}
    ];

    // Current mode of form.
    $scope.CREATE = 1;
    $scope.UPDATE = 2;

    // Current type of element data.
    $scope.NORMAL = 1;
    $scope.LINKED = 2;

    // Controller variable inizialization.
    $scope.init = function() {
      $scope.mode = $scope.CREATE;
      $scope.type = $scope.NORMAL;
      $scope.isRequesting = false;
      $scope.currentElement = null;
      $scope.parentElement = null;
      $scope.elementData = {};

      ElementSvc.getElementsByUser()
        .then(function(res) {
          $scope.elements = res.data;

          // Save the reference of all the elements that can be parents to avoid future
          // Loops to find the right parent of a child.
          angular.forEach($scope.elements, function(element, key1) {
            angular.forEach(linkRelations, function(relation, key2) {
              if (element.name.toUpperCase() === relation.parent) {
                relation.parentRef = element;
              }
            })
          });
        })
        .catch(function(err) {$log.debug(err);});
    }

    // Populates the needed data for the current controller.
    $scope.init();

    // Selects an element to be displayed.
    // The element selected will be validated to standard or linked element data.
    $scope.selectElement = function(element) {
      $scope.mode = $scope.CREATE;
      $scope.type = $scope.NORMAL;
      $scope.elementData = {};
      $scope.parentElement = null;

      // Check if the element is a child type of element, if so the elements will
      // be filter later with a selected parent elementData, otherwise show all
      // elementData of the element.
      for (var i in linkRelations) {
        if (element.name.toUpperCase() == linkRelations[i].child) {
          $scope.parentElement = linkRelations[i].parentRef;
          $scope.type = $scope.LINKED;
          break;
        }
      }

      if ($scope.currentElement) {
        $scope.currentElement.selected = false;
      }
      
      element.selected = true;
      $scope.currentElement = element;

    }

    // Function to create a new data element.
    $scope.createElementData = function(form) {
      if ($scope.isRequesting) {return;}

      if (form.$invalid) {
        $scope.elementData.hasErrors = true;
        return;
      }

      $scope.elementData.hasErrors = false;

      if ($scope.type === $scope.NORMAL) {
        $scope.createNormalElementData();
      }
      else if ($scope.type === $scope.LINKED) {
        $scope.createLinkedElementData();
      }
    }

    // Function to create a new normal element data
    $scope.createNormalElementData = function () {
      // Here we set the required parameter values for de data element.
      var elementData = {
        elementId: $scope.currentElement.id,
        name: $scope.elementData.name,
        discount: $scope.elementData.discount
      }

      $scope.isRequesting = true; // Block the requests until this one finish
      // Call the data element create service and save it into the element data list
      // when created.
      $scope.elementData.isRequesting = true;
      ElementSvc.createElementData(elementData)
        .then(function(res) {
          $scope.elementData.isRequesting = false;
          Materialize.toast('El elemento ha sido creado.',
            3000, 'green darken-1 rounded');

          $scope.currentElement.ElementData.push(res.data);
          $scope.elementData = {};
          $scope.isRequesting = false;
        })
        .catch(function(err) {
          $scope.elementData.isRequesting = false;
          var errData = err.data;
          if (err.status != 409) {
            Materialize.toast('El elemento no ha sido creado, por favor intentelo nuevamente.',
            3000, 'red darken-1 rounded');
            $scope.isRequesting = false;
            return;
          }

          if (errData.code == 3) {
            Materialize.toast('El nombre del elemento ya está en uso.',
            3000, 'red darken-1 rounded');
            $scope.isRequesting = false;
            return;
          }

        });
    }

    // Function to create a new data element which is linked to another data element.
    $scope.createLinkedElementData = function() {
      // Here we set the required parameter values for de data element.
      var elementData = {
        elementId: $scope.currentElement.id,
        name: $scope.elementData.name,
        discount: $scope.elementData.discount,
        dataParentId: $scope.elementData.parent.id
      }

      $scope.isRequesting = true; // Blocks the requests until this one finish

      $scope.elementData.isRequesting = true;
      // Call the linked data element create service and save it into both the element
      // data list and the parent children when created.
      ElementSvc.createLinkedElementData(elementData)
        .then(function(res) {
          $scope.elementData.isRequesting = false;
          var elementData = res.data;
          Materialize.toast('El elemento ha sido creado.',
            3000, 'green darken-1 rounded');

          elementData.ElementParent = [];
          elementData.ElementParent.push($scope.elementData.parent);
          $scope.currentElement.ElementData.push(res.data);
          $scope.elementData.name = "";
          $scope.elementData.discount = "";
          $scope.isRequesting = false;

        })
        .catch(function(err) {
          $scope.elementData.isRequesting = false;
          var errData = err.data;
          if (err.status != 409) {
            Materialize.toast('El elemento no ha sido creado, por favor intentelo nuevamente.',
            3000, 'red darken-1 rounded');
            $scope.isRequesting = false;
            return;
          }

          if (errData.code == 3) {
            Materialize.toast('El nombre del elemento ya está en uso.',
            3000, 'red darken-1 rounded');
            $scope.isRequesting = false;
            return;
          }

        });
    }

    //
    $scope.selectElementData = function(elementData) {
      $scope.mode = $scope.UPDATE;
      $scope.elementData = {
        id: elementData.id,
        elementId: elementData.elementId,
        name: elementData.name,
        discount: elementData.discount,
        parent: $scope.elementData.parent,
        self: elementData
      }
    }

    //
    $scope.exitUpdate = function() {
      $scope.mode = $scope.CREATE;
      $scope.elementData = {
        parent: $scope.elementData.parent
      };
    }

    $scope.updateElementData = function (form) {
      if ($scope.isRequesting) {return;}

      if (form.$invalid) {
        $scope.elementData.hasErrors = true;
        return;
      }

      $scope.elementData.hasErrors = false;

      if ($scope.type === $scope.NORMAL) {
        $scope.updateNormalElementData();
      }
      else if ($scope.type === $scope.LINKED) {
        $scope.updateLinkedElementData();
      }
    }

    // Function to update an existing element data.
    $scope.updateNormalElementData = function () {
      credentials = {
        elementDataId: $scope.elementData.id,
        elementId: $scope.elementData.elementId,
        name: $scope.elementData.name,
        discount: $scope.elementData.discount
      }

      $scope.elementData.isRequesting = true;
      ElementSvc.updateElementData(credentials)
      .then(function (res) {
        $scope.elementData.isRequesting = false;
        Materialize.toast('El elemento ha sido actualizado correctamente.',
          3000, 'green darken-1 rounded');

        $scope.elementData.self.name = res.data.name;
        $scope.elementData.self.discount = res.data.discount;
        $scope.elementData = {
          parent: $scope.elementData.parent
        };
        $scope.isRequesting = false;
        $scope.mode = $scope.CREATE;
      })
      .catch(function (err) {
        $scope.elementData.isRequesting = false;
        var errData = err.data;
        if (err.status != 409) {
          Materialize.toast('El elemento no ha sido actualizado, por favor intentelo nuevamente.',
          3000, 'red darken-1 rounded');
          $scope.isRequesting = false;
          return;
        }

        if (errData.code == 3) {
          Materialize.toast('El nombre del elemento ya está en uso.',
          3000, 'red darken-1 rounded');
          $scope.isRequesting = false;
          return;
        }

      });
    }

    // Function to update an existing element data.
    $scope.updateLinkedElementData = function () {
      credentials = {
        elementDataId: $scope.elementData.id,
        elementId: $scope.elementData.elementId,
        dataParentId: $scope.elementData.parent.id,
        name: $scope.elementData.name,
        discount: $scope.elementData.discount
      }

      $scope.elementData.isRequesting = true;
      ElementSvc.updateLinkedElementData(credentials)
      .then(function (res) {
        $scope.elementData.isRequesting = false;
        Materialize.toast('El elemento ha sido actualizado correctamente.',
          3000, 'green darken-1 rounded');

        $scope.elementData.self.name = res.data.name;
        $scope.elementData.self.discount = res.data.discount;
        $scope.elementData = {
          parent: $scope.elementData.parent
        };
        $scope.isRequesting = false;
        $scope.mode = $scope.CREATE;
      })
      .catch(function (err) {
        $scope.elementData.isRequesting = false;
        var errData = err.data;
        if (err.status != 409) {
          Materialize.toast('El elemento no ha sido actualizado, por favor intentelo nuevamente.',
          3000, 'red darken-1 rounded');
          $scope.isRequesting = false;
          return;
        }

        if (errData.code == 3) {
          Materialize.toast('El nombre del elemento ya está en uso.',
          3000, 'red darken-1 rounded');
          $scope.isRequesting = false;
          return;
        }

      });
    }

    // Function that returns true when the current element is a child element.
    $scope.isLinked = function () {
      return $scope.type === $scope.LINKED;
    }

    // Function that returns true when the form is ready to show, create, update,
    // and delete elementData.
    $scope.isReadyToCRUD = function () {
      if ($scope.type === $scope.LINKED) {
        return $scope.elementData.parent && $scope.parentElement && $scope.currentElement;
      }
      else {
        return $scope.currentElement != null;
      }
    }

    // Function that returns true when the current mode is activated to
    // create new elementData to the element.
    $scope.isCreating = function () {
      return $scope.mode === $scope.CREATE;
    }

    // Function that return true when the current mode is activated to
    // update existing elementData of the element.
    $scope.isUpdating = function () {
      return $scope.mode === $scope.UPDATE;
    }

  }
]);
