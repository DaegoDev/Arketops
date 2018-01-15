var arketops = angular.module('arketops');
arketops.controller('ResultListCtrl', ['$scope', '$log', '$state', '$stateParams', 'CompanySvc',
'ProductSvc', 'StorageSvc', 'orderByFilter',
 function($scope, $log, $state, $stateParams, CompanySvc, ProductSvc, StorageSvc, orderBy) {
  $scope.searchValue = StorageSvc.get('searchValue', 'session');
  $scope.filter = StorageSvc.get('filter', 'session');

  $scope.result = [];
  $scope.total = 0;
  $scope.flagProductHeader = true;
  $scope.orderOptionsCompanies = {};
  $scope.orderOptionsProducts = {};

  // Declaración de variables para la paginación.
  $scope.filteredResults = [];
  $scope.itemsPerPage = 20;

  $scope.choicesOrderCompany = [
    {
      name: 'Seleccione',
      value: -1
    },
    {
      name: 'Nombre - Alfabeticamente descendente',
      value: 1
    },
    {
      name: 'Nombre - Alfabeticamente ascendente',
      value: 2
    }
  ]
  $scope.orderOptionsCompanies = {
    choices: $scope.choicesOrderCompany,
    selected: $scope.choicesOrderCompany[0]
  }

  $scope.choicesOrderProduct = [
    {
      name: 'Seleccione',
      value: -1
    },
    {
      name: 'Nombre - Alfabeticamente descendente',
      value: 1
    },
    {
      name: 'Nombre - Alfabeticamente ascendente',
      value: 2
    },
    {
      name: 'Precio - De menor a mayor',
      value: 3
    },
    {
      name: 'Precio - De mayor a menor',
      value: 4
    }
  ]
  $scope.orderOptionsProducts = {
    choices: $scope.choicesOrderProduct,
    selected: $scope.choicesOrderProduct[0]
  }

  $scope.figureOutResultsToDisplay = function(currentPage) {
    var begin = ((currentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.filteredResults = $scope.result.slice(begin, end);
  };

  $scope.changePage = function(currentPage) {
    $scope.figureOutResultsToDisplay(currentPage);
  };

  $scope.isCompanySearch = function () {
    return $scope.filter.toUpperCase() == "EMPRESA";
  }

  $scope.isProductSearch = function () {
    return $scope.filter.toUpperCase() == "PRODUCTO"
  }

  $scope.isAllSearch = function () {
    return $scope.filter.toUpperCase() == "TODO"
  }

  if ($scope.isCompanySearch()) {
    $scope.isRequesting = true;
    CompanySvc.getByName({
        name: $scope.searchValue
      })
      .then((result) => {
        $scope.isRequesting = false;
        $scope.result = result.data;
        $scope.total = $scope.result.length
        $scope.figureOutResultsToDisplay(1);
      })
      .catch((err) => {
        $scope.isRequesting = false;
      })
  } else if ($scope.isProductSearch()) {
    $scope.isRequesting = true;
    ProductSvc.getByName({
        name: $scope.searchValue
      })
      .then((result) => {
        $scope.isRequesting = false;
        $scope.result = result.data;
        $scope.total = $scope.result.length
        $scope.figureOutResultsToDisplay(1);
      })
      .catch((err) => {
        $scope.isRequesting = false;
      })
  } else if ($scope.isAllSearch()) {
    $scope.isRequesting = true;
    CompanySvc.getCompaniesAndProducts({
        keyword: $scope.searchValue
      })
      .then((result) => {
        $scope.isRequesting = false;
        $scope.result = result.data.companies;
        $scope.result.push('divider');
        $scope.result = $scope.result.concat(result.data.products);
        $scope.total = $scope.result.length - 1;
        $scope.figureOutResultsToDisplay(1);
        console.log(result.data);
      })
      .catch((err) => {
        $scope.isRequesting = false;
      })
  }

  $scope.orderCompanies = function () {
    var value = $scope.orderOptionsCompanies.selected.value;
    if (value === -1) {
      return;
    } else if (value === 1) {
      $scope.result = orderBy($scope.result, 'name', false);
    } else if (value === 2) {
      $scope.result = orderBy($scope.result, 'name', true);
    }
    $scope.figureOutResultsToDisplay(1);
  }

  $scope.orderProducts = function () {
    var value = $scope.orderOptionsProducts.selected.value;
    if (value === -1) {
      return;
    } else if (value === 1) {
      $scope.result = orderBy($scope.result, 'name', false);
    } else if (value === 2) {
      $scope.result = orderBy($scope.result, 'name', true);
    } else if (value === 3) {
      $scope.result = orderBy($scope.result, 'price', false);
    } else if (value === 4) {
      $scope.result = orderBy($scope.result, 'price', true);
    }
    $scope.figureOutResultsToDisplay(1);
  }

}]);
