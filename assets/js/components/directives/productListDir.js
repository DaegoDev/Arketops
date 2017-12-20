var arketops = angular.module('arketops');

arketops.directive('productList', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/shared/product-list.html',
    scope: {
      products: '=',
      options: '='
    },
    controller: 'productListCtrl'
  }
})

arketops.controller('productListCtrl', ['$scope', '$log', '$ngConfirm', 'AuthSvc', '$state', 'StorageSvc', 'ProductSvc', 'ElementSvc', productListCtrl]);

function productListCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc, ProductSvc, ElementSvc) {
  $scope.init = function() {
    if ($scope.options.mode.toUpperCase() === "OWNER") {
      // Gets all elements of the current User.
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
      .catch(function(err) {$log.error(err);});

      // Gets all the states a product can be.
      ProductSvc.getStates()
        .then(function(res) {$scope.states = res.data;})
        .catch(function(err) {$log.error(err);});
    }

    // angular.forEach($scope.products, function (product, key) {
    //   for (var i in product.ElementData) {
    //     if (product.ElementData[i].id == 4) {
    //       product.tax = product.ElementData[i];
    //       break;
    //     }
    //   }
    //   console.log(product);
    // });
  }
  $scope.init();
  console.log($scope);
  console.log($scope.products);

  // Flag function to know if the current elements belongs to the user.
  $scope.isPrivate = function() {
    if (!$scope.options.mode) {
      return false;
    }
    return $scope.options.mode.toUpperCase() === 'OWNER';
  }

  // Function to ask confirmation to delete a product.
  $scope.deleteConfirm = function(product) {
    $ngConfirm({
      theme: 'material',
      title: "Eliminar producto",
      content: "¿Desea eliminar el producto con código " + product.code + "?",
      type: 'orange',
      useBootstrap: false,
      boxWidth: '450px',
      typeAnimated: true,
      buttons: {
        confirm: {
          text: "Aceptar",
          btnClass: 'btn',
          action: function() {
            $scope.deleteProduct(product);
          }
        },

        exit: {
          text: "Cancelar",
          btnClass: 'btn',
          action: function() {

          }
        }
      }
    });
  }

  // Function to delete a product.
  $scope.deleteProduct = function(product) {
    $scope.options.isRequesting = true;
    ProductSvc.delete(product.id)
      .then(function(res) {
        $scope.options.isRequesting = false;
        $scope.products.splice($scope.products.indexOf(product), 1);
        Materialize.toast('El producto ha sido eliminado correctamente.',
          3000, 'green darken-1 rounded');
        return true;
      })
      .catch(function(err) {
        $scope.options.isRequesting = false;
        if (err.status != 409) {
          Materialize.toast('El producto no ha sido eliminado, por favor intentelo nuevamente.',
          3000, 'red darken-1 rounded');
          return true;
        }
      });
  }

  //Function to get the tax value.
  $scope.getTax = function (product) {
    console.log(product);
    var taxValue = null;
    product.ElementData.forEach(function (elementData) {
      if (elementData.Element.name.toUpperCase() === 'IMPUESTO') {
        taxValue = elementData.discount;
      }
    })
    return taxValue;
  }

  // Function to update a product.
  $scope.updateProduct = function(product) {
    $scope.product = {
      id: product.id,
      name: product.name,
      code: product.code,
      description: product.description,
      price: product.price,
      imageURI: product.imageURI
    };

    angular.forEach(product.ElementData, function (elementData, index) {
      for (var i in $scope.categories.ElementData) {
        if ($scope.categories.ElementData[i].id == elementData.id) {
          $scope.product.category = $scope.categories.ElementData[i];
          break;
        }
      }

      for (var i in $scope.brands.ElementData) {
        if ($scope.brands.ElementData[i].id == elementData.id) {
          $scope.product.brand = $scope.brands.ElementData[i];
          break;
        }
      }

      for (var i in $scope.taxes.ElementData) {
        if ($scope.taxes.ElementData[i].id == elementData.id) {
          $scope.product.tax = $scope.taxes.ElementData[i];
          break;
        }
      }

      for (var i in $scope.lines.ElementData) {
        if ($scope.lines.ElementData[i].id == elementData.id) {
          $scope.product.line = $scope.lines.ElementData[i];
          break;
        }
      }
    });

    for (var i in $scope.states) {
      if ($scope.states[i].id == product.stateId) {
        $scope.product.state = $scope.states[i];
      }
    }

    $ngConfirm({
      title: 'EDITAR PRODUCTO.',
      theme: 'material',
      type: 'orange',
      contentUrl: 'templates/private/company/product-update.html',
      scope: $scope,
      backgroundDismiss: true,
      // useBootstrap: false,
      boxWidth: '80%',
      buttons: {
        save: {
          btnClass: 'btn',
          text: 'Guardar',
          action: function (scope, button) {
            credentials = {
              productId: scope.product.id,
              code: scope.product.code,
              name: scope.product.name,
              description: scope.product.description,
              price: scope.product.price,
              stateId: scope.product.state.id,
              elements: []
            };

            if (scope.product.category) {
              credentials.elements.push(scope.product.category.id);
            }
            if ($scope.product.line) {
              credentials.elements.push(scope.product.line.id);
            }
            if ($scope.product.brand) {
              credentials.elements.push(scope.product.brand.id);
            }
            if ($scope.product.tax) {
              credentials.elements.push(scope.product.tax.id);
            }

            $scope.options.isRequesting = true;
            ProductSvc.update(credentials)
            .then(function (resProduct) {
              $scope.options.isRequesting = false;
              if ($scope.options.reload) {
                $scope.options.reload();
              }

              Materialize.toast('El producto ha sido actualizado correctamente.',
                3000, 'green darken-1 rounded');
            })
            .catch(function (err) {
              $scope.options.isRequesting = false;
              $log.log(err)
              var errData = err.data;
              if (err.status != 409) {
                Materialize.toast('El producto no ha sido actualizado, por favor intentelo nuevamente.',
                3000, 'red darken-1 rounded');
                return true;
              }

              if (errData.code == 3) {
                Materialize.toast('El código del producto ya está en uso.',
                3000, 'red darken-1 rounded');
              }

              return true;
            });
          }
        },
        exit: {
          btnClass: 'btn',
          text: 'Salir',
          action: function (scope, button) {

          }
        }
      }
    });
  }
}
