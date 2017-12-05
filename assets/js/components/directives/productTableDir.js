var arketops = angular.module('arketops');

arketops.directive('productTable', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/shared/product-table.html',
    scope: {
      products: '=',
      selectList: '=?',
      ctrlFn: '&'
    },
    controller: 'productTableCtrl',
  }
})

arketops.controller('productTableCtrl', ['$scope', '$log', '$ngConfirm', 'AuthSvc', '$state',
  'StorageSvc', 'orderByFilter', productTableCtrl
]);

function productTableCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc, orderBy) {

  console.log($scope.products);
  $scope.elementsIndex = {};

  $scope.products[0].ElementData.forEach(function (elementData, index, elementDataList) {
    switch (elementData.Element.name.toUpperCase()) {
      case 'MARCA':
        $scope.elementsIndex.marca = index;
        break;
      case 'CATEGORÍA':
        $scope.elementsIndex.categoria = index;
        break;
      case 'LÍNEA':
        $scope.elementsIndex.linea = index;
        break;
      default:

    }
  })

  $scope.propertyName = 'code';
  $scope.reverse = true;
  $scope.products = orderBy($scope.products, $scope.propertyName, $scope.reverse);

  $scope.addProductToList = function(productSelected, index) {
    var productToQuote = buildProduct(productSelected);
    if (productToQuote) {
      if ($scope.products[index].added) {
        $ngConfirm({
          title: 'Error',
          content: 'Ya se añadió el producto.',
          type: 'red',
          boxWidth: '30%',
          useBootstrap: false,
          backgroundDismiss: true,
          buttons: {
            accept: {
              text: 'Aceptar'
            }
          }
        });
        return;
      }
      productToQuote.indexProductList = index;
      $scope.selectList.push(productToQuote);
      $scope.products[index].added = true;
    }
  }

  function buildProduct(productSelected) {
    var totalDiscount = 0;
    var brand = null;
    var category = null;
    var line = null;
    var tax = null;
    var amount = 1;
    productSelected.ElementData.forEach(function(elementData, index, elementDataList) {
      if (elementData.ClientSuppliers.length === 0) {
        var discount = elementData.discount
      } else {
        var discount = elementData.ClientSuppliers[0].ClientDiscount.discount;
      }
      switch (elementData.Element.name.toUpperCase()) {
        case 'MARCA':
          brand = elementData.name;
          totalDiscount += discount;
          break;
        case 'CATEGORÍA':
          category = elementData.name;
          totalDiscount += discount;
          break;
        case 'LÍNEA':
          line = elementData.name;
          totalDiscount += discount;
          break;
        case 'IMPUESTO':
          tax = {
            name: elementData.name,
            discount: discount
          };

      }
    })
    productSelected.brand = brand;
    productSelected.tax = tax;
    productSelected.totalDiscount = totalDiscount;
    productSelected.amount = amount;
    productSelected.subtotal = ((amount * productSelected.price) * ((tax.discount / 100) + 1)) * (1 - (totalDiscount / 100));

    return productSelected;
  }

  $scope.removeProductOfList = function (indexProductList, product) {
    var indexSelectList = $scope.selectList.indexOf(product);
    $scope.selectList.splice(indexSelectList, 1);
    $scope.products[indexProductList].added = false;
    $scope.ctrlFn();
  }


  $scope.getElementDataName = function (elementDataArray, elementName) {
    var n = elementDataArray.length
    for (var i = 0; i < n; i++) {
      if (elementDataArray[i].Element.name.toUpperCase() === elementName) {
        return elementDataArray[i].name;
        break;
      }
    }
  }

  $scope.sortBy = function (propertyName) {
    $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName) ? !$scope.reverse : false;
    $scope.propertyName = propertyName;
    if (propertyName.toUpperCase() == 'CODE' || propertyName.toUpperCase() == 'NAME') {
      $scope.products = orderBy($scope.products, $scope.propertyName, $scope.reverse);
    }else {
      $scope.products = orderBy($scope.products, 'ElementData[' + $scope.elementsIndex[propertyName] + '].name', $scope.reverse);
    }

  }

}
