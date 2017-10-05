var arketops = angular.module('arketops');
arketops.controller('ProductCtrl', ['$scope', '$log', '$state', '$stateParams',
'$ngConfirm', 'ElementSvc', 'ProductSvc',
function($scope, $log, $state, $stateParams, $ngConfirm, ElementSvc, ProductSvc) {
  $scope.init = function () {
    $scope.product = {};
    $scope.categories = null;
    $scope.lines = null;
    $scope.brands = null;
    $scope.taxes = null;

    ElementSvc.getElementsByUser()
    .then(function (res) {
      $scope.elements = res.data;
      $scope.elements.forEach(function (element, i, elements) {
        switch (element.name.toUpperCase()) {
          case "CATEGORIA":
            $scope.categories = element;
            break;
          case "LINEA":
            $scope.lines = element;
            break;
          case "MARCA":
            $scope.brands = element;
            break;
          case "IMPUESTO":
            $scope.taxes = element;
            break;
          default:
            break;
        }
      });
      console.log($scope.elements);
    })
    .catch(function (err) {
      console.log(err);
    });
  }
  $scope.init();

  $scope.getElementByName = function (name) {
    for (var i in $scope.elements) {
      if ($scope.elements[i].name.toUpperCase() == name) {
        return $scope.elements[i];
      }
      console.log($scope.elements[i].name.toUpperCase());
    }
  }

  $scope.createProduct = function () {
    credentials = {
      code: $scope.product.code,
      name: $scope.product.name,
      description: $scope.product.description,
      price: $scope.product.price,
      stateId: $scope.product.stateId,
      imageDataURI: $scope.product.image,
      elements: [
        $scope.product.category.id,
        $scope.product.line.id,
        $scope.product.brand.id,
        $scope.product.tax.id
      ]
    };
    console.log(credentials);
    ProductSvc.create(credentials)
    .then(function (res) {
      console.log(res);
    })
    .catch(function (err) {
      console.log(err);
    });
  }

  // Handles image loading and encryption.
  $scope.onLoad = function(e, reader, file, fileList, fileOjects, fileObj) {
    $scope.imgAvatarStyle = {'background-image': 'none'};
    $scope.fileObject = fileObj;
    $scope.product.image = 'data:' + fileObj.filetype + ';base64,' + fileObj.base64;
  };

}]);
