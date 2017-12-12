var arketops = angular.module('arketops');
arketops.controller('ClientQuotationsListCtrl', ['$scope', '$filter', '$log', '$state', '$stateParams',
  '$ngConfirm', 'StorageSvc', 'QuotationSvc', '$sce',
  function($scope, $filter, $log, $state, $stateParams, $ngConfirm, StorageSvc, QuotationSvc, $sce) {
    // Declaration of variables
    $scope.client = JSON.parse(StorageSvc.get('clientSelected', 'session'));
    $scope.quotations = {};
    $scope.quotation = {};
    // console.log($scope.client);

    QuotationSvc.getByClientSupplierId({clientSupplierId: $scope.client.ClientSupplier.id})
    .then((res) => {
      console.log(res.data);
      $scope.quotations = res.data;
    })
    .catch((err) => {
      console.log(err);
    })

    $scope.showQuotation = function (quotation) {

      // var file = new Blob([quotation.fileURI], {type: 'application/pdf'});
      // var fileURL = URL.createObjectURL(file);
      // $scope.pdfUrl = $sce.trustAsResourceUrl(fileURL);
      // $scope.httpHeaders = { Authorization: 'Bearer some-aleatory-token' };
      if ($scope.quotations.loading) {
        return;
      }
      $scope.quotations.loading = true;
      QuotationSvc.getQuotationFile({quotationId: quotation.id})
      .then((res) => {
        var file = new Blob([res.data], {type: 'application/pdf'});
        var fileURL = URL.createObjectURL(file);
        $scope.pdfUrl = $sce.trustAsResourceUrl(fileURL);
        $scope.quotations.loading = false;
        $ngConfirm({
          title: 'Cotización',
          content: '<embed type="application/pdf" ng-src="{{pdfUrl}}" width="100%" height="550">',
          scope: $scope,
          theme: 'supervan',
        })
      })
      .catch((err) => {
        console.log(err);
      })
    }

    $scope.openFormToConfirm = function (quotation, indexQuotation) {
      // Function to create the Mont's day
      function buildDaysMonth() {
        $scope.daysMonth = [];
        for (var i = 1; i < 31; i++) {
          $scope.daysMonth.push(i);
        }
      }
      buildDaysMonth()

      // Validity of the quotation in days.
      $scope.quotation.validityPeriod = {
        choices: $scope.daysMonth,
      }

      // Call the service to get the payment forms.
      QuotationSvc.getPaymentforms()
        .then((res) => {
          $scope.quotation.paymentForms = {
            choices: res.data
          }
        })
      $ngConfirm({
        title: 'Confirmar cotización',
        contentUrl: 'templates/private/company/confirm-quotation.html',
        scope: $scope,
        type: 'orange',
        useBootstrap: false,
        buttons: {
          cancel: {
            text: 'Cancelar',
            btnClass: 'red',
            action: function (scope, button) {

            }
          },
          confirm: {
            text: 'Confirmar',
            btnClass: 'btn-success',
            action: function (scope, button) {
              return confirmQuotation(quotation, indexQuotation)
            }
          }
        }
      })
    }

    function confirmQuotation(quotation, indexQuotation) {
      var quotationValidityPeriod = null;
      var paymentFormObject = null;
      var paymentFormId = null;
      var quotationId = null;
      var params = null;

      quotationValidityPeriod = $scope.quotation.validityPeriod.selected;
      paymentFormObject = $scope.quotation.paymentForms.selected;
      quotationId = quotation.id;

      if (!quotationValidityPeriod) {
        Materialize.toast('Ingrese el tiempo de validez de la cotización.', 4000, 'red darken-1 rounded');
        return false;
      }

      if (!paymentFormObject) {
        Materialize.toast('Ingrese la forma de pago.', 4000, 'red darken-1 rounded');
        return false;
      }

      paymentFormId = paymentFormObject.id;

      params = {
        quotationId: quotationId,
        quotationValidityPeriod: quotationValidityPeriod,
        paymentFormId: paymentFormId,
      }

      QuotationSvc.confirmToClient(params)
      .then((res) => {
        console.log(indexQuotation);
        console.log(res.data);
        $scope.quotations.requested[indexQuotation] = res.data;
        Materialize.toast('Se confirmó la cotización exitosamente.', 4000, 'green darken-1 rounded');
      })
      .catch((err) => {
        Materialize.toast('No fue posible confirmar la cotización.', 4000, 'red darken-1 rounded');
      })
    }

  }
]);
