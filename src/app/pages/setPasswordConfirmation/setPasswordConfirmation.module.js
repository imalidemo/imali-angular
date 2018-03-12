(function () {
    'use strict';

    angular.module('BlurAdmin.pages.setPasswordConfirmation', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('setPasswordConfirmation', {
                url: '/setpassword/',
                views:{
                    'admin':{
                        templateUrl: 'app/pages/setPasswordConfirmation/setPasswordConfirmation.html',
                        controller: 'SetPasswordConfirmationCtrl'
                    }
                }
            });
    }

})();
