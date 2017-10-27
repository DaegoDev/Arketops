/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/
  '*': true, // Disables all policies defined above.

  CompanyController: {
    getProfile: 'isAuthenticated',
    updateData: 'isAuthenticated',
    updatePassword: 'isAuthenticated',
    updateImageProfile: 'isAuthenticated',
    deactivateAccount: 'isAuthenticated',
    followCompany: 'isAuthenticated',
    validateSupplier: 'isAuthenticated',
    getSuppliers: 'isAuthenticated',
    getClients: 'isAuthenticated',
    setDiscountToClient: 'isAuthenticated',
    getByName: 'isValidToDiscounts',
    searchAll: 'isValidToDiscounts',
    recoverPassword: 'isValidRecovery',
  },

  ElementController: {
    getElements: 'isAuthenticated',
    getElementsByUser: 'isAuthenticated',
    createElement: 'isAuthenticated',
    createElementData: 'isAuthenticated',
    createLinkedElementData: 'isAuthenticated',
    editElementData: 'isAuthenticated',
    editLinkedElementData: 'isAuthenticated'
  },

  ProductController: {
    create: 'isAuthenticated',
    delete: 'isAuthenticated',
    getByCompany: 'isValidToDiscounts',
    getMyProducts: 'isAuthenticated',
  },

  HeadquartersController: {
    create: 'isAuthenticated'
  }



  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
	// RabbitController: {

		// Apply the `false` policy as the default for all of RabbitController's actions
		// (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
		// '*': false,

		// For the action `nurture`, apply the 'isRabbitMother' policy
		// (this overrides `false` above)
		// nurture	: 'isRabbitMother',

		// Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
		// before letting any users feed our rabbits
		// feed : ['isNiceToAnimals', 'hasRabbitFood']
	// }
};
