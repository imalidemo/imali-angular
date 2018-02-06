(function () {
    'use strict';

    angular.module('BlurAdmin.pages.history')
        .controller('HistoryCtrl', HistoryCtrl);
    /** @ngInject */
    function HistoryCtrl($scope, environmentConfig, $state, $uibModal, toastr, $http, $location, cookieManagement, errorToasts, $window, errorHandler) {
        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.pagination = {
            itemsPerPage: 26,
            pageNo: 1,
            maxSize: 5
        };
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

        vm.getCurrency = function (code) {
            var result = $.grep(vm.currencies, function (e) {
                return e.code == code;
            });
            return result.length == 0 ? {} : result[0];
        }

        vm.getQuotesUrl = function () {
            vm.filterParams = '?page=' + $scope.pagination.pageNo + '&page_size=' + $scope.pagination.itemsPerPage
                + '&orderby=-created';

            return environmentConfig.EXCHANGE_API + '/user/quotes/' + vm.filterParams;
        };

        $scope.getQuotes = function () {

            $scope.loadingQuotes = true;

            var quotesUrl = vm.getQuotesUrl();

            $http.get(quotesUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.loadingQuotes = false;
                $scope.quotesData=res.data.data
                var quotes = res.data.data.results;
                for (var i = 0; i < quotes.length; i++) {
                    var quote = quotes[i];
                    console.log(quote)
                    quote.from_amount = quote.from_amount / Math.pow(10, quote.from_currency.divisibility);
                    quote.to_amount = quote.to_amount / Math.pow(10, quote.to_currency.divisibility);
                    try{
                        quote.metadata = JSON.parse(quote.metadata);
                    }
                    catch (e){

                    }
                }
                $scope.quotes = quotes;
            }).catch(function (error) {
                $scope.loadingQuotes = false;
                if (error.status == 403) {
                    errorHandler.handle403();
                    return;
                }
                errorToasts.evaluateErrors(error.data);
            });

        }
        $scope.getQuotes();
        $scope.gotoConversion = function (quote) {
            if (quote.conversion == null) {
                $state.go('quote', {quote_id: quote.id})
            }
        }
    }

})();



