var arketops = angular.module('arketops');
arketops.controller('ResultListCtrl', ['$scope', '$log', '$state', '$stateParams', 'CompanySvc', 'ProductSvc', 'StorageSvc',
 function($scope, $log, $state, $stateParams, CompanySvc, ProductSvc, StorageSvc) {
  $scope.searchValue = StorageSvc.get('searchValue', 'session');
  $scope.filter = StorageSvc.get('filter', 'session');

  $scope.result = [];
  $scope.total = 0;

  // Declaración de variables para la paginación.
  $scope.filteredResults = [];
  $scope.itemsPerPage = 20;

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
    CompanySvc.getByName({
        name: $scope.searchValue
      })
      .then((result) => {
        console.log(result.data);
        $scope.result = result.data;
        $scope.total = $scope.result.length
        $scope.figureOutResultsToDisplay(1);
      })
  } else if ($scope.isProductSearch()) {
    ProductSvc.getByName({
        name: $scope.searchValue
      })
      .then((result) => {
        // console.log(result.data);
        $scope.result = result.data;
        $scope.total = $scope.result.length
        $scope.figureOutResultsToDisplay(1);
      })

  } else if ($scope.isAllSearch()) {
    CompanySvc.getCompaniesAndProducts({
        keyword: $scope.searchValue
      })
      .then((result) => {
        // console.log(result.data);
        $scope.result = result.data.companies.concat(result.data.products);
        $scope.total = $scope.result.length
        $scope.figureOutResultsToDisplay(1);
      })
  }

}]);
