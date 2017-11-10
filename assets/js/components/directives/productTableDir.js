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
  'StorageSvc', productTableCtrl
]);

function productTableCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc) {

  console.log($scope.products);

  $scope.addProductToList = function(productSelected, index) {
    var productToQuote = buildProduct(productSelected);
    if (productToQuote) {
      if ($scope.products[index].added) {
        $ngConfirm('Ya se añadió el producto.');
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
        case 'CATEGORIA':
          category = elementData.name;
          totalDiscount += discount;
          break;
        case 'LINEA':
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
    // var productBuilt = {
    //   id: productSelected.id,
    //   code: productSelected.code,
    //   name: productSelected.name,
    //   brand: brand,
    //   category: category,
    //   line: line,
    //   tax: tax,
    //   price: productSelected.price,
    //   totalDiscount: totalDiscount,
    //   amount: amount,
    //   subtotal: ((amount * productSelected.price) * ((tax.discount / 100) + 1)) * (1 - (totalDiscount / 100))
    // }
    // return productBuilt;
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

}
