(function () {
    'use strict';

    angular.module('BlurAdmin.pages.setPasswordConfirmation', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('setPasswordConfirmation', {
                url: '/password/set/confirm/',
                views:{
                    'admin':{
                        templateUrl: 'app/pages/setPasswordConfirmation/setPasswordConfirmation.html',
                        controller: 'SetPasswordConfirmationCtrl'
                    }
                }
            });
    }

})();
