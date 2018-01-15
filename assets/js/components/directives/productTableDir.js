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
  'StorageSvc', 'orderByFilter', '$filter', productTableCtrl
]);

function productTableCtrl($scope, $log, $ngConfirm, AuthSvc, $state, StorageSvc, orderBy, $filter) {

  $scope.productsFiltered = $scope.products;

  $(".dropdown-button + .dropdown-content").on("click",function(event){
        event.stopPropagation();
  });

  $scope.elementsIndex = {};
  $scope.elementDataValues = {};
  $scope.elementDataValues.brand = [];
  $scope.elementDataValues.category = [];
  $scope.elementDataValues.line = [];
  $scope.elementDataValuesPushed = [];

  // Recover the index for each elementData in array elementData.
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
  });

  $scope.propertyName = 'code';
  $scope.reverse = true;
  $scope.productsFiltered = orderBy($scope.products, $scope.propertyName, $scope.reverse);

  $scope.products.forEach(function (product, index, products) {
    var brandValue = product.ElementData[$scope.elementsIndex.marca] ? product.ElementData[$scope.elementsIndex.marca].name : '';
    var categoryValue = product.ElementData[$scope.elementsIndex.categoria] ? product.ElementData[$scope.elementsIndex.categoria].name : '';
    var lineValue = product.ElementData[$scope.elementsIndex.linea] ? product.ElementData[$scope.elementsIndex.linea].name : '';


    var indexBrand = $scope.elementDataValuesPushed.indexOf(brandValue.toUpperCase())
    if (indexBrand === -1) {
      $scope.elementDataValues.brand.push({
        name: brandValue,
        selected: true
      });
      $scope.elementDataValuesPushed.push(brandValue.toUpperCase())
    }

    var indexCategory = $scope.elementDataValuesPushed.indexOf(categoryValue.toUpperCase())
    if (indexCategory === -1) {
      $scope.elementDataValues.category.push({
        name: categoryValue,
        selected: true
      });
      $scope.elementDataValuesPushed.push(categoryValue.toUpperCase())
    }

    var indexLine = $scope.elementDataValuesPushed.indexOf(lineValue.toUpperCase())
    if (indexLine === -1) {
      $scope.elementDataValues.line.push({
        name: lineValue,
        selected: true
      });
      $scope.elementDataValuesPushed.push(lineValue.toUpperCase())
    }

  })

  $scope.addProductToList = function(productSelected, index) {
    var productToQuote = buildProduct(productSelected);
    if (productToQuote) {
      if ($scope.productsFiltered[index].added) {
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
      $scope.productsFiltered[index].added = true;
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
      if (!elementData.ClientSuppliers || elementData.ClientSuppliers.length === 0) {
        var discount = elementData.discount
      } else {
        var discount = elementData.ClientSuppliers[0].ClientDiscount.discount;
      }
      switch (elementData.Element.id) {
        case 1:
          brand = elementData.name;
          totalDiscount += discount;
          break;
        case 2:
          category = elementData.name;
          totalDiscount += discount;
          break;
        case 3:
          line = elementData.name;
          totalDiscount += discount;
          break;
        case 4:
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
    productSelected.subtotal = ((amount * productSelected.price) * (((tax ? tax.discount : 0) / 100) + 1)) * (1 - (totalDiscount / 100));
    return productSelected;
  }

  $scope.removeProductOfList = function (indexProductList, product) {
    var indexSelectList = $scope.selectList.indexOf(product);
    $scope.selectList.splice(indexSelectList, 1);
    $scope.productsFiltered[indexProductList].added = false;
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
      $scope.productsFiltered = orderBy($scope.products, $scope.propertyName, $scope.reverse);
    }else {
      $scope.productsFiltered = orderBy($scope.products, 'ElementData[' + $scope.elementsIndex[propertyName] + '].name', $scope.reverse);
    }

  }

  $scope.filter = function (elementDataValue, type) {
    elementDataValue.selected = !elementDataValue.selected;
    var indexElementData = null;
    var checkList = null;
    if (type.toUpperCase() == 'BRAND') {
      indexElementData = $scope.elementsIndex.marca;
      checkList = $scope.elementDataValues.brand;
    } else if (type.toUpperCase() == 'CATEGORY'){
      indexElementData = $scope.elementsIndex.categoria;
      checkList = $scope.elementDataValues.category;
    } else if (type.toUpperCase() == 'LINE') {
      indexElementData = $scope.elementsIndex.linea;
      checkList = $scope.elementDataValues.line;
    }
    $scope.productsFiltered = $filter('filterElementData')($scope.products, checkList, indexElementData);
  }

  $scope.filterByProductName = function () {
    $scope.productsFiltered = $filter('filter')($scope.products, $scope.searchText);
  }

}
