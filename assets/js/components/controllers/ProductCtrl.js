var arketops = angular.module('arketops');
arketops.controller('ProductCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'ElementSvc', 'ProductSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, ElementSvc, ProductSvc) {
    $scope.init = function() {
      $scope.product = {};
      $scope.elementData = {};
      $scope.categories = null;
      $scope.lines = null;
      $scope.brands = null;
      $scope.taxes = null;

      ElementSvc.getElementsByUser()
        .then(function(res) {
          $scope.elements = res.data;
          $scope.elements.forEach(function(element, i, elements) {
            switch (element.id) {
              case 2:
                $scope.categories = element;
                break;
              case 3:
                $scope.lines = element;
                break;
              case 1:
                $scope.brands = element;
                break;
              case 4:
                $scope.taxes = element;
                break;
              default:
                break;
            }
          });
        })
        .catch(function(err) {
          $log.error(err);
        });

      // Gets all the states a product can be.
      ProductSvc.getStates()
        .then(function(res) {$scope.states = res.data;})
        .catch(function(err) {  $log.error(err);});
    }
    $scope.init();

    $scope.getElementByName = function(name) {
      for (var i in $scope.elements) {
        if ($scope.elements[i].name.toUpperCase() == name) {
          return $scope.elements[i];
        }
      }
    }

    $scope.updatePrice = function () {
      if ($scope.product.tax) {
        $scope.product.TotalPrice = $scope.product.price * (1 + ($scope.product.tax.discount / 100));
      } else {
        $scope.product.TotalPrice = $scope.product.price;
      }
    }

    $scope.createProduct = function() {
      if ($scope.product.isRequesting) {
        return;
      }

      if ($scope.productForm.$invalid) {
        $scope.product.hasErrors = true;
        return;
      }

      $scope.product.hasErrors = false;

      credentials = {
        code: $scope.product.code,
        name: $scope.product.name,
        description: $scope.product.description,
        price: $scope.product.price,
        stateId: $scope.product.state.id,
        imageDataURI: $scope.product.image,
        elements: []
      };

      if ($scope.product.category) {
        credentials.elements.push($scope.product.category.id);
      }
      if ($scope.product.line) {
        credentials.elements.push($scope.product.line.id);
      }
      if ($scope.product.brand) {
        credentials.elements.push($scope.product.brand.id);
      }
      if ($scope.product.tax) {
        credentials.elements.push($scope.product.tax.id);
      }

      $scope.product.isRequesting = true;
      ProductSvc.create(credentials)
        .then(function(res) {
          Materialize.toast('El producto ha sido creado.',
            3000, 'green darken-1 rounded');
          $scope.product = {};
          $scope.fileObject = null;
          $scope.product.isRequesting = false;
        })
        .catch(function(err) {
          var errData = err.data;
          if (err.status != 409) {
            Materialize.toast('El producto no ha sido creado, por favor intentelo nuevamente.',
            3000, 'red darken-1 rounded');
            $scope.product.isRequesting = false;
            return;
          }

          if (errData.code == 3) {
            Materialize.toast('El código del producto ya está en uso.',
            3000, 'red darken-1 rounded');
          }

          if (errData.code == 4) {
            Materialize.toast('El formato de la imagen es incorrecto.',
            3000, 'red darken-1 rounded');
          }

          $scope.product.isRequesting = false;
        });
    }

    // This function shows a modal to create a normal element data.
    $scope.createElementModal = function(element) {
      $scope.element = element;
      $ngConfirm({
        theme: 'material',
        title: 'Crear ' + element.name,
        contentUrl: 'templates/private/company/element-create-modal.html',
        useBootstrap: false,
        boxWidth: '500px',
        type: 'orange',
        scope: $scope,
        buttons: {
          create: {
            text: 'Crear',
            btnClass: 'btn',
            action: function(scope, button) {
              if (scope.elementData.isRequesting) {
                return false;
              }

              if (scope.elementForm.$invalid) {
                scope.elementData.hasErrors = true;
                return false;
              }
              scope.elementData.hasErrors = false;

              var elementData = {
                elementId: element.id,
                name: scope.elementData.name,
                discount: scope.elementData.discount
              }

              scope.elementData.isRequesting = true;
              ElementSvc.createElementData(elementData)
                .then(function(res) {
                  element.ElementData.push(res.data);
                  scope.elementData = {};
                  Materialize.toast('Elemento creado correctamente.',
                    3000, 'green darken-1 rounded');
                  return true;
                })
                .catch(function(err) {
                  $log.debug(err);
                  scope.elementData = {};
                  Materialize.toast('El elemento no ha sido creado, por favor intentelo nuevamente.',
                    3000, 'red darken-1 rounded');
                  return false;
                });
            }
          },

          exit: {
            text: 'Salir',
            btnClass: 'btn',
            action: function(scope, button) {
              scope.elementData = {};
            }
          }
        }
      });
    }

    // This function shows a modal to create a linked element data.
    $scope.createLinkedElementModal = function(element, parent) {
      $scope.parent = parent;
      $ngConfirm({
        theme: 'material',
        title: 'Crear ' + element.name,
        contentUrl: 'templates/private/company/linkedelement-create-modal.html',
        useBootstrap: false,
        boxWidth: '500px',
        type: 'orange',
        scope: $scope,
        buttons: {
          create: {
            text: 'Crear',
            btnClass: 'btn',
            action: function(scope, button) {
              if (scope.elementData.isRequesting) {
                return false;
              }

              if (scope.elementForm.$invalid) {
                scope.elementData.hasErrors = true;
                return false;
              }

              scope.elementData.hasErrors = false;

              var elementData = {
                elementId: element.id,
                name: scope.elementData.name,
                discount: scope.elementData.discount,
                dataParentId: scope.elementData.parent.id
              }

              scope.elementData.isRequesting = true;
              ElementSvc.createLinkedElementData(elementData)
                .then(function(res) {
                  res.data.ElementParent = [scope.elementData.parent];
                  element.ElementData.push(res.data);
                  scope.elementData = {};
                  Materialize.toast('Elemento creado correctamente.',
                    3000, 'green darken-1 rounded');
                  return true;
                })
                .catch(function(err) {
                  $log.debug(err);
                  scope.elementData = {};
                  Materialize.toast('El elemento no ha sido creado, por favor intentelo nuevamente.',
                    3000, 'red darken-1 rounded');
                  return false;
                });
            }
          },

          exit: {
            text: 'Salir',
            btnClass: 'btn',
            action: function(scope, button) {
              scope.elementData = {};
            }
          }
        }
      });
    }

    // Handles image loading and encryption.
    $scope.onLoad = function(e, reader, file, fileList, fileOjects, fileObj) {
      $scope.imgAvatarStyle = {'background-image': 'none'};
      $scope.fileObject = fileObj;
      $scope.product.image = 'data:' + fileObj.filetype + ';base64,' + fileObj.base64;
    };

  }
]);
