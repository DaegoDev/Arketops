var arketops = angular.module('arketops');

arketops.directive('topbar', function() {
  return {
    restric: 'E',
    templateUrl: 'templates/public/topbar.html',
    controller: 'topbarCtrl'
  }
})

arketops.controller('topbarCtrl', ['$scope', '$cookieStore', '$ngConfirm', 'AuthSvc',
'$interval', '$state', '$anchorScroll', '$location', '$timeout', 'AnchorSmoothScroll',
  function($scope, $cookieStore, $ngConfirm, AuthSvc, $interval, $state, $anchorScroll,
    $location, $timeout, AnchorSmoothScroll) {
    $(document).ready(function() {
      $('.scrollspy').scrollSpy({
        scrollOffset: 0
      });
    });

    $scope.user = {};

    // variable que guarda el estilo de la sección de busqueda.
    $scope.searchNavStyle = {};

    // Variable para verificar que el usuario esté autenticado.
    $scope.authenticated = AuthSvc.isAuthenticated();

    $scope.$on('renovateRole', function(evt) {
      $scope.authenticated = AuthSvc.isAuthenticated();
      $scope.closeModal();
    });

    // Opciones para el select de busqueda.
    $scope.filters = {
      choices: ['Todo', 'Empresa', 'Producto'],
      selected: "Todo"
    }

    // Función para cerrar cesión.
    $scope.signout = function() {
      AuthSvc.signout();
      $state.reload();
    }

    // Función que despliega la sección de busqueda.
    $scope.openSearchNav = function() {
      $scope.searchNavStyle.height == '20%' ? $scope.searchNavStyle.height = '0%' : $scope.searchNavStyle.height = '20%';
    }

    // Función que oculta la sección de busqueda.
    $scope.closeSearchNav = function() {
      $scope.searchNavStyle = {
        height: '0%'
      }
    }

    // Muestra la vista con los resultados de la busqueda.
    $scope.showResults = function() {
      var searchValue = $scope.searchValue;
      var filter = $scope.filters.selected;
      console.log($scope.filters.selected);
      if (!searchValue) {
        return;
      }
      $scope.closeSearchNav();
      $state.go('showResults', {
        searchValue: searchValue,
        filter: filter
      });
    }

    // Enfoca el formulario para el registro.
    $scope.showFormSignup = function() {
      if ($state.current.name != 'home') {
        $state.go('home');
        $timeout(function() {
          AnchorSmoothScroll.scrollTo('signup');
          // $anchorScroll('signup');
        }, 100);
      } else {
        AnchorSmoothScroll.scrollTo('signup');
        // $anchorScroll('signup');
      };
    }

    // Enfoca el formulario para contactanos.
    $scope.showFormContactus = function() {
      if ($state.current.name != 'home') {
        $state.go('home');
        $timeout(function() {
          AnchorSmoothScroll.scrollTo('contactus');
          // $anchorScroll('signup');
        }, 100);
      } else {
        AnchorSmoothScroll.scrollTo('contactus');
        // $anchorScroll('signup');
      };
    }

    $scope.openModal = false;

    $scope.modalReady = function() {
      $scope.openModal = true;
    }

    $scope.modalComplete = function() {
      $scope.openModal = false;
    }

    $scope.closeModal = function() {
      $scope.openModal = false;
      console.log("closeModal");
      // console.log($scope.openModal);
    }

    this.closeModal = $scope.closeModal;
    this.openModal = $scope.openModal;


    // $interval(function() {
    //   console.log($scope.openModal);
    //   $scope.openModal = false;
    // } , 5000)


  }
]);
