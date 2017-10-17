var arketops = angular.module('arketops');
arketops.controller('ClientDiscountsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'ElementSvc', 'StorageSvc', 'CompanySvc', 'orderByFilter',
  function($scope, $log, $state, $stateParams, $ngConfirm, ElementSvc, StorageSvc, CompanySvc, orderBy) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));

    ElementSvc.getElements()
    .then((res) => {
      $scope.resElements = res.data;
      // console.log($scope.resElements);
      $scope.elements = {
        choices: $scope.resElements,
        selected: $scope.resElements[0]
      }
      $scope.getElementData($scope.elements.selected, 0)
    })
    .catch((err) => {
      console.log(err);
    })

    $scope.getElementData = function (value, indexDefault) {
      $scope.elementData = {
        choices: value.ElementData,
        selected: value.ElementData[indexDefault]
      }
    }

    $scope.getElementsDiscountByClient = function () {
      ElementSvc.getClientDiscounts({clientSupplierId: $scope.client.ClientSupplier.id})
      .then((res) => {
        $scope.elementDataDiscounts = res.data;
      })
      .catch((err) => {
        console.log(err);
      })
    }

    $scope.getElementsDiscountByClient();

    $scope.addDiscount = function () {
      // Variables
      var elementData = null;
      var discount = null;
      var params = null;

      elementData = $scope.elementData.selected;
      discount = $scope.discount;

      if (!discount || !elementData) {
        Materialize.toast('Debe ingresar el descuento', 4000, 'red darken-1 rounded');
        return;
      }

      params = {
        clientId: $scope.client.id,
        elementDataId: elementData.id,
        discount: discount
      }

      CompanySvc.setDiscountToClient(params)
      .then((res) => {
        $scope.getElementsDiscountByClient();
        $scope.discount = '';
        Materialize.toast('Se añadió correctamente', 4000, 'green darken-1 rounded');
      })
      .catch((err) => {

      })
    }

    $scope.selectDiscount = function (elementDataDiscount) {
      $scope.selectedDiscount = true;
      $scope.elementDataDiscount = elementDataDiscount;
      var n = $scope.resElements.length
      for (var i = 0; i < n; i++) {
        if (elementDataDiscount.Element.name == $scope.resElements[i].name) {
          $scope.elements.selected = $scope.resElements[i];
          $scope.getElementData($scope.elements.selected, 0);
          var m = $scope.elementData.choices.length
          for (var j = 0; j < m; j++) {
            var elementData = $scope.resElements[i].ElementData[j];
            if (elementDataDiscount.name == elementData.name) {
              $scope.elementData.selected = elementData;
              break;
            }
          }
          break;
        }
      }
      $scope.discount = elementDataDiscount.ClientDiscount.discount;
    }

    $scope.removeDiscount = function (clientDiscountId) {
      $ngConfirm({
        title: '¿Realmente desea eliminar el descuento?',
        useBootstrap: true,
        content: 'Este dialogo eligirá la opción cancelar automaticamente en 6 segundo si no responde.',
        autoClose: 'cancel|6000',
        boxWidth: '30%',
        useBootstrap: false,
        buttons: {
          deleteDiscount: {
            text: 'Eliminar',
            btnClass: 'btn-red',
            action: function() {
              CompanySvc.deleteDiscountToClient({clientDiscountId: clientDiscountId})
              .then((res) => {
                Materialize.toast('Se eliminó correctamente', 4000, 'green darken-1 rounded');
                $scope.getElementsDiscountByClient();
              })
              .catch((err) => {
                console.log(err);
              })
            }
          },
          cancel: function() {

          }
        }
      });

    }

    $scope.enableAdd = function () {
      $scope.selectedDiscount = false;
      $scope.discount = '';
    }

    $scope.updateDiscount = function () {
      // Declaration of variables
      var clientDiscountId = null;
      var newDiscount = null;
      var params = {};

      // Variables definition and validation;
      clientDiscountId = $scope.elementDataDiscount.ClientDiscount.id;
      newDiscount = $scope.discount;
      if (!newDiscount) {
        Materialize.toast('Debe ingresar el descuento', 4000, 'red darken-1 rounded');
        return;
      }

      params = {
        clientDiscountId: clientDiscountId,
        newDiscount: newDiscount
      }

      CompanySvc.updateDiscountToClient(params)
      .then((res) => {
        $scope.getElementsDiscountByClient();
        $scope.selectedDiscount = false;
        $scope.discount = '';
        Materialize.toast('Se actualizó correctamente', 4000, 'green darken-1 rounded');
      })
      .catch((err) => {
        console.log(err);
      })
    }
  }

]);
