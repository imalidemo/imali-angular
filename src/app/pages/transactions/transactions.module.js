(function () {
    'use strict';

    angular.module('BlurAdmin.pages.transactions', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('transactions', {
                url: '/transactions',
                templateUrl: 'app/pages/transactions/transactions.html',
                params: {
                    code: null
                },
                controller: "TransactionsCtrl",
                title: 'Send Money',
                sidebarMeta: {
                    order: 1
                }
            });
    }

})();
