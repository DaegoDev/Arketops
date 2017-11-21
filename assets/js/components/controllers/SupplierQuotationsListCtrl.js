var arketops = angular.module('arketops');
arketops.controller('SupplierQuotationsListCtrl', ['$scope', '$filter', '$log', '$state', '$stateParams',
  '$ngConfirm', 'StorageSvc', 'QuotationSvc', '$sce', 'orderByFilter',
  function($scope, $filter, $log, $state, $stateParams, $ngConfirm, StorageSvc, QuotationSvc, $sce, orderBy) {
    // Declaration of variables
    $scope.supplier = JSON.parse(StorageSvc.get('supplierSelected', 'session'));
    $scope.quotations = {};

    QuotationSvc.getByClientSupplierId({clientSupplierId: $scope.supplier.ClientSupplier.id})
    .then((res) => {
      console.log(res.data);
      // $scope.quotations.created = orderBy(res.data.created, 'code');
      // $scope.quotations.requested = orderBy(res.data.requested, 'code')
      $scope.quotations = res.data;
    })
    .catch((err) => {
      console.log(err);
    })

    $scope.showQuotation = function (quotation) {
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
          content: '<embed type="application/pdf" ng-src="{{pdfUrl}}" width="100%" height="600">',
          scope: $scope,
          theme: 'supervan',
        })
      })
      .catch((err) => {
        console.log(err);
      })
    }

  }
]);
