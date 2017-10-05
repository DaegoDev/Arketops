var arketops = angular.module('arketops');
arketops.controller('ClientDiscountsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'ElementSvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, ElementSvc, StorageSvc) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));

    ElementSvc.getElements()
    .then((res) => {
      $scope.resElements = res.data;
      console.log(resElements);
      $scope.elements = {
        choices: $scope.resElements,
        selected: $scope.resElements[0]
      }

    })
    .catch((err) => {
      console.log(err);
    })

    $scope.getElementData = function (value) {
      $scope.elementData = {
        choices: value.ElementData,
        selected: value.ElementData[0]
      }
    }

    ElementSvc.getElementsDiscountByClient({clientSupplierId: $scope.client.ClientSupplier.id})
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    })
  }
]);
