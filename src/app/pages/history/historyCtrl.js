(function () {
    'use strict';

    angular.module('BlurAdmin.pages.history')
        .controller('HistoryCtrl', HistoryCtrl);
    /** @ngInject */
    function HistoryCtrl($scope,environmentConfig,$uibModal,toastr,$http,$location,cookieManagement,errorToasts,$window,errorHandler) {
        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');

        $scope.loadingQuotes = true;
        $scope.quotes = [];

        vm.currencies = [
          {
            "code": "USD",
            "description": "United States Dollar",
            "symbol": "$",
            "unit": "dollar",
            "divisibility": 2,
            "enabled": true
          },
          {
            "code": "NGN",
            "description": "Nigerian Naira",
            "symbol": "\u20a6",
            "unit": "naira",
            "divisibility": 2,
            "enabled": true
          },
        ];      

        vm.getCurrency = function(code) {
          var result = $.grep(vm.currencies, function(e){ return e.code == code; });
          return result.length == 0 ? {} : result[0];
        }
    
        vm.getQuotes = function() {
          $scope.loadingQuotes = true;
          $http.get(environmentConfig.EXCHANGE_API + '/user/quotes/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.loadingQuotes = false;
                var quotes = res.data.data;
                for(var i=0;i<quotes.length;i++) {
                  var quote = quotes[i];
                  quote.from_currency = vm.getCurrency(quote.from_currency);
                  quote.to_currency = vm.getCurrency(quote.to_currency);
                  quote.from_amount = quote.from_amount / Math.pow(10, quote.from_currency.divisibility);
                  quote.to_amount = quote.to_amount / Math.pow(10, quote.to_currency.divisibility);
                }
                $scope.quotes = quotes;
            }).catch(function (error) {
                $scope.loadingQuotes = false;
                if(error.status == 403){
                    errorHandler.handle403();
                    return;
                }
                errorToasts.evaluateErrors(error.data);
            });

        }  
        vm.getQuotes();
    }

})();



