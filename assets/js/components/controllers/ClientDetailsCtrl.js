var arketops = angular.module('arketops');
arketops.controller('ClientDetailsCtrl', ['$scope', '$log', '$state', '$stateParams',
  '$ngConfirm', 'CompanySvc', 'StorageSvc',
  function($scope, $log, $state, $stateParams, $ngConfirm, CompanySvc, StorageSvc) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));

    $scope.options = [{
      name: 'Datos personales',
      selected: false
    }, {
      name: 'Productos',
      selected: false
    }, {
      name: 'Descuentos',
      selected: false
    }, {
      name: 'Cotizaciones',
      selected: false
    }, {
      name: 'Cotizar',
      selected: false
    }]

    $scope.goToState = function(option, index) {
      if (typeof $scope.lastOption == 'number') {
        var lastOption = $scope.lastOption;
        $scope.options[lastOption].selected = false;
      }
      $scope.lastOption = index;
      $scope.options[index].selected = true;
      if (option == 'Datos personales') {
        $state.go('clientDetails.personalData')
      } else if (option.toUpperCase() == 'PRODUCTOS') {
        $state.go('clientDetails.products');
      } else if (option.toUpperCase() == 'DESCUENTOS') {
        $state.go('clientDetails.discounts');
      } else if (option.toUpperCase() == 'COTIZACIONES') {
        $state.go('clientDetails.quotationsList');
      } else if (option.toUpperCase() == 'COTIZAR') {
        $state.go('clientDetails.quotationCreate')
      }
    }

    $scope.goToState('Datos personales', 0);

    CompanySvc.isSupplier({companyId: $scope.client.id})
    .then((res) => {
        $scope.isSupplier = res.data;
    })
    .catch((err) => {
      console.log(err);
    })

    $scope.followCompany = function () {
      $ngConfirm({
        title: 'Confirmación',
        useBootstrap: true,
        content: '¿Desea seguir a este cliente?',
        boxWidth: '30%',
        useBootstrap: false,
        buttons: {
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-orange',
            action: function() {
              CompanySvc.followCompany({supplierId: $scope.client.id})
              .then((res) => {
                $scope.isSupplier = true;
              })
              .catch((err) => {
                Materialize.toast('Ocurrió un error al ejecutar la acción.', 4000, 'red darken-1 rounded');
              })
            }
          },
          cancel: function() {

          }
        }
      });
    }
  }
]);
