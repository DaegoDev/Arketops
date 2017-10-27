var arketops = angular.module('arketops');

arketops.directive('productList', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/shared/product-list.html',
    scope: {
      products: '=',
      mode: '@'
    },
    controller: 'productListCtrl',
  }
})

arketops.controller('productListCtrl',
['$scope', '$log', '$ngConfirm', 'AuthSvc', '$state', 'StorageSvc', 'ProductSvc', productListCtrl]);

function productListCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc, ProductSvc) {

  // Flag function to know if the current elements belongs to the user.
  $scope.isPrivate = function () {
    return $scope.mode.toUpperCase() === 'OWNER';
  }

  // Function to ask confirmation to delete a product.
  $scope.deleteConfirm = function (product) {
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
          action: function () {
            $scope.deleteProduct(product);
          }
        },

        exit: {
          text: "Cancelar",
          btnClass: 'btn',
          action: function () {

          }
        }
      }
    });
  }

  // Function to delete a product.
  $scope.deleteProduct = function (product) {
    ProductSvc.delete(product.id)
    .then(function (res) {
      $scope.products.splice($scope.products.indexOf(product), 1);
    })
    .catch(function (err) {
      $log.log(err);
    });
  }
}
