'use stric';

(function () {
  var arketops = angular.module('arketops',['ui.router', 'ngCookies','ui.materialize','ngMdIcons', 'cp.ngConfirm']);

  // Inicializacion de la configuracion principal al ingresar al dominio.
  arketops.run(['$rootScope',
    function($rootScope) {
      // $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
      //   if (!fromState.name) {
      //     if (StorageService.get("auth_token", "session")) {
      //       role = StorageService.get("role", "session");
      //       if (role) {
      //         PermRoleStore.defineRole('ANON', function() {
      //           return false;
      //         });
      //         PermRoleStore.defineRole('ADMINISTRADOR', function() {
      //           return false;
      //         });
      //         PermRoleStore.defineRole('DESPACHADOR', function() {
      //           return false;
      //         });
      //         PermRoleStore.defineRole('CLIENTE', function() {
      //           return false;
      //         });
      //         PermRoleStore.defineRole(role.toUpperCase(), function() {
      //           return true;
      //         });
      //         $rootScope.$broadcast('renovateRole');
      //       }
      //     } else {
      //       PermRoleStore.clearStore();
      //       PermRoleStore.defineRole('ADMINISTRADOR', function() {
      //         return false;
      //       });
      //       PermRoleStore.defineRole('DESPACHADOR', function() {
      //         return false;
      //       });
      //       PermRoleStore.defineRole('CLIENTE', function() {
      //         return false;
      //       });
      //       PermRoleStore.defineRole("ANON", function() {
      //         return true;
      //       });
      //       $rootScope.$broadcast('renovateRole');
      //     }
      //   }
      // });
      //
      // $rootScope.$on('$stateChangeSuccess', function() {
      //   document.body.scrollTop = document.documentElement.scrollTop = 0;
      // });
    }
  ]);

  arketops.config(['$compileProvider', function($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
  }]);
})();
