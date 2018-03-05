(function () {
    'use strict';

    angular.module('BlurAdmin.pages.quote', [])
        .config(routeConfig);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('quote', {
                url: '/quote',
                templateUrl: 'app/pages/quote/quote.html',
                controller: 'QuoteCtrl',
                title: 'Your quote',
                params: {
                    to_currency: null,
                    from_amount:null,
                    from_currency:null,
                    quote_id:null
                }
            });
    }

})();
