angular.module('arketops')
.factory('AuthSvc', ['$http', '$rootScope', 'StorageSvc', 'PermRoleStore',
function($http, $rootScope, StorageSvc, PermRoleStore){
var storageType = 'session';

	return {
		// Servicio para el inicio de sesión de un usuario.
		signinUser: function(credentials) {
			var role = null;
			var signin = $http({
				url: '/auth/signinUser',
				method: 'POST',
				data: credentials
			});

			signin.then(function(res) {
				// Creación de la sesión de un usuario cuando las credenciales son validas.
				role = res.data.role.toUpperCase();
				PermRoleStore.clearStore();
				PermRoleStore.defineRole('ANON', function () {return false;});
				PermRoleStore.defineRole('COMPANY', function () {return false;});
				PermRoleStore.defineRole(role, function () {return true;});
				StorageSvc.set("auth_token", res.data.token, storageType);
				StorageSvc.set("role", role, storageType);
				$rootScope.$broadcast('renovateRole');
			})
			.catch(function (err) {
				console.log(err);
			});
			return signin;
		},

		// Servicio para el cierre de sesión de cualquier usuario.
		signout: function() {
			// Terminación de la sesión de un usuario.
			PermRoleStore.clearStore();
			PermRoleStore.defineRole("ANON", function () {return true;})
			PermRoleStore.defineRole('COMPANY', function () {return false;});
			StorageSvc.unset("auth_token", storageType);
			StorageSvc.unset("role", storageType);
			$rootScope.$broadcast('renovateRole');
		},

		// Servicio para autenticar una sesión de usuario activa.
		isAuthenticated: function() {
			var role = StorageSvc.get("role", storageType);
			if (!role) {return false;}
			if (role == "ANON") {return false;}
			return true;
		},

		// Servicio para obtener el tipo de rol del usuario de la sesión actual.
		getRole: function() {
			return StorageSvc.get("role", storageType);
		},
	};
}]);

//Interceptor de peticiones para authorización de usuarios.
angular.module('arketops')
.factory('AuthInterceptor', ['$q', '$injector', '$rootScope', function($q, $injector, $rootScope) {
	var StorageSvc = $injector.get('StorageSvc');
	var PermRoleStore = $injector.get('PermRoleStore');
	var storageType = 'session';

	return {
		request: function(config) {
			var token = null;

			if (StorageSvc.get('auth_token', storageType)) {
				token = StorageSvc.get('auth_token', storageType);
			}
			if (token && (config.url.substring(0,4) != 'http')) {
				config.headers.authorization = 'JWT ' + token;
			}
			return config;
		},

		responseError: function(response) {
			if (response.status === 401 || response.status === 403) {
				StorageSvc.unset('auth_token', storageType);
				StorageSvc.unset('role', storageType);
				PermRoleStore.clearStore();
				PermRoleStore.defineRole('ANON', function () {return true;});
				$rootScope.$broadcast('renovateRole');
				$injector.get('$state').go('home');
			}
			return $q.reject(response);
		}
	};
}])
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('AuthInterceptor');
}]);
