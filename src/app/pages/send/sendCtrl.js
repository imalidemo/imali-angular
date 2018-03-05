(function () {
    'use strict';

    angular.module('BlurAdmin.pages.send')
        .controller('SendCtrl', SendCtrl);

    /** @ngInject */
    function SendCtrl($rootScope, $state, $scope, $location, $uibModal, currencyModifiers, toastr, cookieManagement, environmentConfig, $http, errorToasts, errorHandler, $window) {

        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.to_currency={};
        $scope.pagination = {
            itemsPerPage: 26,
            pageNo: 1,
            maxSize: 5
        };
        $scope.currencies = [
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
            {
                "code": "GBP",
                "description": "British Pound Sterling",
                "symbol": "£",
                "unit": "sterling",
                "divisibility": 2,
                "enabled": true
            }
        ];

        $scope.getCurrency = function (code) {
            var result = $.grep($scope.currencies, function (e) {
                return e.code == code;
            });
            return result.length == 0 ? {} : result[0];
        }

        $scope.transactions = [];
        $scope.to_amount = null;
        $scope.from_currency = {
            "code": "NGN",
            "description": "Nigerian Naira",
            "symbol": "\u20a6",
            "unit": "naira",
            "divisibility": 2,
            "enabled": true
        };
        $scope.tab = "get_quote";
        $scope.loadingQuote = false;
        $scope.loading = false;
        $scope.savingQuote = false;
        $scope.transactionsStateMessage = '';
        $scope.transactionsData = {};
        $scope.loadingTransactions = false;
        $scope.typeOptions = ['Type', 'Credit', 'Debit']; //Transfer
        $scope.statusOptions = ['Status', 'Initiating', 'Processing', 'Pending', 'Complete', 'Failed'];
        $scope.currencyOptions = [];
        $scope.orderByOptions = ['Largest', 'Latest', 'Smallest'];

        vm.getTransactionUrl = function () {
            vm.filterParams = '?page=' + $scope.pagination.pageNo + '&page_size=' + $scope.pagination.itemsPerPage
                + '&orderby=-created';

            return environmentConfig.API + '/transactions/' + vm.filterParams;
        };

        $scope.openModal = function (page, size, transaction) {
            vm.theModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'TransactionModalCtrl',
                resolve: {
                    transaction: function () {
                        return transaction;
                    }
                }
            });

            vm.theModal.result.then(function (transaction) {
                if (transaction) {
                    $scope.searchParams = {
                        searchId: '',
                        searchUser: $state.params.code || '',
                        searchDateFrom: '',
                        searchDateTo: '',
                        searchType: 'Type',
                        searchStatus: 'Status',
                        searchCurrency: {code: 'Currency'},
                        searchOrderBy: 'Latest',
                        searchSubType: ''
                    };
                    $scope.getLatestTransactions();
                }
            }, function () {
            });
        };

        $http({
            url: environmentConfig.EXCHANGE_API + '/user/rates/',
            method: "GET",
            params: {
                from_currency: "NGN"
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': vm.token
            }
        }).then(function (res) {
            $scope.loadingQuote = false;
            $scope.response = res.data.data.results;
            for (var i = 0; i < $scope.response.length; i++) {
                if ($scope.response[i].to_currency.code === "GBP") {
                    $scope.GBP_currency = $scope.response[i];
                } else if ($scope.response[i].to_currency.code === "USD") {
                    $scope.USD_currency = $scope.response[i];
                }
            }
        }).catch(function (error) {
            $scope.loadingQuote = false;
            if (error.status == 403) {
                errorHandler.handle403();
                return;
            }
            errorToasts.evaluateErrors(error.data);
        });

        $scope.saveQuote = function (to_currency, to_amount) {
            if (vm.token) {
                /*var currency = $scope.getCurrency(to_currency);*/

                var amount = to_amount;
                $scope.toAmountInCents=currencyModifiers.convertToCents((to_amount),to_currency.to_currency.divisibility);
                $scope.savingQuote = true;
                $http({
                    url: environmentConfig.EXCHANGE_API + '/user/quotes/',
                    method: "POST",
                    data: {
                        to_amount: $scope.toAmountInCents,
                        from_currency: to_currency.from_currency.code,
                        to_currency: to_currency.to_currency.code
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    var quote=res.data.data;
                    $state.go('quote',{
                        quote_id:quote.id
                    });
                }).catch(function (error) {
                    $scope.savingQuote = false;
                    if (error.status == 403) {
                        errorHandler.handle403();
                        return;
                    }
                    errorToasts.evaluateErrors(error.data);
                });
            }

        }
        $scope.getQuote = function (from_currency, to_amount) {
            if (from_currency === "USD") {
                $scope.to_currency = $scope.USD_currency
            } else if (from_currency === "GBP") {
                $scope.to_currency = $scope.GBP_currency
            }
            if($scope.to_currency.fixed_rate){
                $scope.rate=$scope.to_currency.fixed_rate
            }else{
                $scope.rate=$scope.to_currency.rate
            }
            $scope.NGNInCents=currencyModifiers.convertToCents((to_amount),$scope.to_currency.from_currency.divisibility);
            $scope.NGNInCents =$scope.NGNInCents / $scope.rate
            $scope.changeTab('show_quote');
        }

        $scope.changeTab = function (tabName) {
            $scope.tab = tabName;
        }


    }

})();
