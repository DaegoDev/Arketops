angular.module('arketops')
.factory('RecoverPasswordSvc', ['$http', function($http){
	return {
		// Inicia el proceso de recuperación de contraseña de un profesor.
		startRecover: function (params) {
			var company = $http({
				url: '/company/requestTokenRecovery',
				method: 'GET',
				params: params
			});
			return company;
		},

		// Servicio que recupera la contraseña.
		recoverPassword: function (credentials, token) {
			var company = $http({
				url: '/company/recoverPassword',
				method: 'PUT',
				params: credentials,
				headers: {
					Authorization: 'JWT ' + token,
				}
			});
			return company;
		},

	};
}]);
