var arketops = angular.module('arketops');
arketops.controller('SupplierDiscountsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'ElementSvc', 'StorageSvc', 'CompanySvc', 'orderByFilter',
  function($scope, $log, $state, $stateParams, $ngConfirm, ElementSvc, StorageSvc, CompanySvc, orderBy) {
    // Declaration of variables
    $scope.supplier = JSON.parse(StorageSvc.get('supplierSelected', 'session'));


    $scope.getElementsDiscountByClient = function () {
      ElementSvc.getClientDiscounts({clientSupplierId: $scope.supplier.ClientSupplier.id})
      .then((res) => {
        $scope.elementDataDiscounts = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    }

    $scope.getElementsDiscountByClient();
  }

]);
