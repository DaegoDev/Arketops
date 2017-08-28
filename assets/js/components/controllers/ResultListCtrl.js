var arketops = angular.module('arketops');
arketops.controller('ResultListCtrl', ['$scope', '$log', '$state', '$stateParams', 'CompanySvc', 'ProductSvc', function($scope, $log, $state, $stateParams, CompanySvc, ProductSvc) {
  $scope.searchValue = $stateParams.searchValue;
  $scope.filter = $stateParams.filter;

  $scope.result = [];
  $scope.total = 0;

  // Declaración de variables para la paginación.
  $scope.filteredResults = [];
  $scope.itemsPerPage = 10;

  $scope.figureOutResultsToDisplay = function(currentPage) {
    var begin = ((currentPage - 1) * $scope.itemsPerPage);
    var end = begin + $scope.itemsPerPage;
    $scope.filteredResults = $scope.result.slice(begin, end);
  };

  $scope.changePage = function(currentPage) {
    console.log(currentPage);
    $scope.figureOutResultsToDisplay(currentPage);
  };

  if ($scope.filter.toUpperCase() == "EMPRESA") {
    CompanySvc.getByName({
        name: $scope.searchValue
      })
      .then((result) => {
        // console.log(result.data);
        $scope.result = result.data;
        $scope.total = $scope.result.length
        $scope.figureOutResultsToDisplay(1);
      })
  } else if ($scope.filter.toUpperCase() == "PRODUCTO") {
    ProductSvc.getByName({
        name: $scope.searchValue
      })
      .then((result) => {
        // console.log(result.data);
        $scope.result = result.data;
        $scope.total = $scope.result.length
        $scope.figureOutResultsToDisplay(1);
      })

  } else if ($scope.filter.toUpperCase() == "TODO") {
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
