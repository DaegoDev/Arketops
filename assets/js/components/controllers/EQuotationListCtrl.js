var arketops = angular.module('arketops');
arketops.controller('EQuotationListCtrl', ['$scope', '$log', 'QuotationSvc', '$sce', '$ngConfirm',
  function($scope, $log, QuotationSvc, $sce, $ngConfirm) {

    QuotationSvc.getMyEQuotations()
    .then(function (res) {
      console.log(res.data);
      $scope.quotations = res.data;
    })
    .catch(function (err) {
      console.log(err);
    });

    $scope.showQuotation = function (quotation) {

      if ($scope.quotations.loading) {
        return;
      }

      $scope.quotations.loading = true;
      QuotationSvc.getEQuotationFile({quotationId: quotation.id})
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
