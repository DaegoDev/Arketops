'use stric';

(function() {
  var arketops = angular.module('arketops', ['ui.router', 'permission', 'permission.ui',
  'ngCookies', 'ui.materialize', 'ngMdIcons', 'ngMessages', 'cp.ngConfirm', 'ngPassword',
  'naif.base64', 'ngAnimate', 'pdf', 'ngJsonExportExcel'
  ]);

  // Inicializacion de la configuracion principal al ingresar al dominio.
  arketops.run(['$rootScope', 'StorageSvc', 'PermRoleStore',
    function($rootScope, StorageSvc, PermRoleStore) {
      $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (!fromState.name) {
          if (StorageSvc.get("auth_token", "session")) {
            role = StorageSvc.get("role", "session");
            if (role) {
              PermRoleStore.defineRole('ANON', function() {
                return false;
              });
              PermRoleStore.defineRole('COMPANY', function() {
                return false;
              });
              PermRoleStore.defineRole(role.toUpperCase(), function() {
                return true;
              });
              $rootScope.$broadcast('renovateRole');
            }
          } else {
            PermRoleStore.clearStore();
            PermRoleStore.defineRole('COMPANY', function() {
              return false;
            });
            PermRoleStore.defineRole("ANON", function() {
              return true;
            });
            $rootScope.$broadcast('renovateRole');
          }
        }
      });

      $rootScope.$on('$stateChangeSuccess', function() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
      });
    }
  ]);

  arketops.config(['$compileProvider', function($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
    $compileProvider.commentDirectivesEnabled(false);
    $compileProvider.cssClassDirectivesEnabled(false);
  }]);

  // Angular filters.
  arketops.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
  });

  // Filter that returns the element's children of an parent element data.
  arketops.filter('linkedElementFilter', function() {
    return function(dataElements, parentElement, hideNull) {
      var filteredDataElements = null;

      if (!dataElements) {
        return null;
      }

      if (!parentElement && hideNull) {
        return null;
      }

      if (!parentElement) {
        return dataElements;
      }

      filteredDataElements = [];

      angular.forEach(dataElements, function (dataElement) {
        for (var i in dataElement.ElementParent) {
          if (dataElement.ElementParent[i].id === parentElement.id ) {
            filteredDataElements.push(dataElement);
            break;
          }
        }
      });

      return filteredDataElements;
    }
  });

  arketops.filter('filterElementData', function() {
    return function(products, checkList, indexElementData) {
      // console.log(products);
      // console.log(checkList);
      console.log(indexElementData);
      var output = [];
      angular.forEach(products, function(product, productKey) {
        angular.forEach(checkList, function(checkValue, checkKey) {
          if (checkValue.selected && product.ElementData[indexElementData].name.toUpperCase().trim().includes(checkValue.name.toUpperCase().trim())) {
            output.push(product);
          }
        });
      });
      console.log(output);
      return output;
    }
  });

  arketops.filter('actionFilter', function() {
    return function(input) {
      if (input == 1) {
        return 'Actualización';
      }
      return 'Creación';
    }
  });

  arketops.filter('elementsFilter', function() {
    return function(input) {
      var stringElements = '';
      input.forEach((elementId, index) => {
        switch (elementId) {
          case 1:
            index == (input.length - 1) ? stringElements += 'Marca ' : stringElements += 'Marca, ';
            break;
          case 2:
            index == (input.length - 1) ? stringElements += 'Categoría ' : stringElements += 'Categoría, ';
            break;
          case 3:
            index == (input.length - 1) ? stringElements += 'Línea ' : stringElements += 'Línea, ';
            break;
          case 4:
            index == (input.length - 1) ? stringElements += 'Impuesto ' : stringElements += 'Impuesto, ';
            break;
          default:
        }
      })
      return stringElements;
    }
  });

})();
