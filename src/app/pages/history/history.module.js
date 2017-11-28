(function () {
  'use strict';

  angular.module('BlurAdmin.pages.history', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('history', {
          url: '/history',
          templateUrl: 'app/pages/history/history.html',
          controller: 'HistoryCtrl',
          title: 'Quotes History',
          sidebarMeta: {
              order: 100
          }
        });
  }

})();
