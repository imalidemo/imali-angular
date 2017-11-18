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
          title: 'Your Quote',
        });
  }

})();
