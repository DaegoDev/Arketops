var arketops = angular.module('arketops');

arketops.directive('productTable', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/shared/product-table.html',
    scope: {
      products: '=',
      selectList: '=?',
    },
    controller: 'productTableCtrl',
  }
})

arketops.controller('productTableCtrl', ['$scope', '$log', 'AuthSvc', '$state', 'StorageSvc', productTableCtrl]);

function productTableCtrl($scope, $log, AuthSvc, $state, StorageSvc) {

  // console.log($scope.products);

  $scope.addProductToList = function(productSelected) {
    var productToQuote = buildProduct(productSelected);
    console.log(productToQuote);
    if (productToQuote) {
      var index = $scope.selectList.indexOf(productToQuote);
      if (index == -1) {
        $scope.selectList.push(productToQuote);
      }
    }
  }

  function buildProduct(productSelected) {
    console.log(productSelected);
    var totalDiscount = 0;
    var brand = null;
    var category = null;
    var line = null;
    var imposed = null;
    productSelected.ElementData.forEach(function (elementData, index, elementDataList) {
      if (elementData.ClientSuppliers.length === 0) {
        var discount = elementData.discount
      }else {
        var discount = elementData.ClientSuppliers[0].ClientDiscount.discount;
      }
      console.log(elementData.Element.name.toUpperCase());
      switch (elementData.Element.name.toUpperCase()) {
        case 'MARCA':
          brand = elementData.name;
          totalDiscount += discount;
          break;
        case 'CATEGORIA':
          category =  elementData.name;
          totalDiscount += discount;
          break;
        case 'LINEA':
          line = elementData.name;
          totalDiscount += discount;
          break;
        case 'IMPUESTO':
          imposed = elementData.name + ' (' + discount + '%)';

      }
    })
    console.log('Bye');
    var productBuilt = {
      code: productSelected.code,
      name: productSelected.name,
      brand: brand,
      category: category,
      line: line,
      imposed: imposed,
      price: productSelected.price,
      totalDiscount: totalDiscount,
      amount: 1
    }
    return productBuilt;
  }

}
