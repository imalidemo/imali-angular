(function () {
    'use strict';

    angular.module('BlurAdmin.pages.quote')
        .controller('QuoteCtrl', QuoteCtrl);

    /** @ngInject */
    function QuoteCtrl($scope, $stateParams,environmentConfig, $uibModal, toastr, $http, $location, cookieManagement, errorToasts, $window, errorHandler) {

        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.selected_account = -1;
        $scope.tab = "bank";
        $scope.loading = true;
        $scope.loadingQuotes = false;
        $scope.newBankData = {};
        $scope.companyBankData = {};
        $scope.active_quote = {};
        $scope.bankAccounts = [{id: -1, bank_name: "Add new account", number: ""}, {
            id: 1,
            bank_name: "Coparts",
            number: ""
        }];
        $scope.to_currency=$stateParams.to_currency
        $scope.from_amount=$stateParams.from_amount
        $scope.from_currency=$stateParams.from_currency

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

        vm.showPaymentTab = function () {
            $scope.tab = "payment";
            vm.getCompanyBankAccount();
        }

        vm.setActiveQuote = function (quote) {
            quote.from_currency = vm.getCurrency(quote.from_currency);
            quote.to_currency = vm.getCurrency(quote.to_currency);
            quote.from_amount = quote.from_amount / Math.pow(10, quote.from_currency.divisibility);
            quote.to_amount = quote.to_amount / Math.pow(10, quote.to_currency.divisibility);
            $scope.active_quote = quote;
            if (quote.bank) {
                vm.showPaymentTab();
            }
        }

        vm.getActiveQuotes = function () {
            $http.get(environmentConfig.EXCHANGE_API + '/user/quotes/?status=active', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.loadingQuotes = false;
                if (res.data.data.length == 0)
                    $location.path('/transactions');
                else
                    vm.setActiveQuote(res.data.data[0]);
            }).catch(function (error) {
                $scope.loadingQuotes = false;
                if (error.status == 403) {
                    errorHandler.handle403();
                    return;
                }
                errorToasts.evaluateErrors(error.data);
            });

        }
        /*vm.getActiveQuotes();*/

        vm.getBankAccounts = function () {
            if (vm.token) {
                $scope.loading = true;
                $http.get(environmentConfig.API + '/user/bank-accounts/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    $scope.loading = false;
                    if (res.status === 200) {
                        $scope.bankAccounts = res.data.data;
                        var item = [{id: -1, bank_name: "Add a new recipient", number: ""},
                                    {id: -2, name: "Copart", bank_name: "Wells Fargo Bank", number: "4114145394", aba: " 121000248", swift: "WFBIUS6S"},
                                    ]
                        $scope.bankAccounts.splice(0, 0, item[0], item[1]);
                    }
                }).catch(function (error) {
                    $scope.loading = false;
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };
        vm.getBankAccounts();

        $scope.addBankAccount = function (newBankAccount) {
            $http.post(environmentConfig.API + '/user/bank-accounts/', newBankAccount, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.loading = false;
                $scope.modifyQuote({bank: res.data.data.id, email: $scope.newBankData.email});
                /* 
                if (res.status === 201) {
                    vm.getBankAccounts();
                    toastr.success('You have successfully added the bank account!');
                    $scope.newBankData = {};
                    $window.scrollTo(0, 0);
                }
                */
            }).catch(function (error) {
                $scope.loading = false;
                if (error.status == 403) {
                    errorHandler.handle403();
                    return
                }
                errorToasts.evaluateErrors(error.data);
            });
        };

        $scope.modifyQuote = function (data) {
            var quote_id = $scope.active_quote.id;
            $scope.loading = true;
            $http.put(environmentConfig.EXCHANGE_API + '/user/quotes/' + quote_id + "/", data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status >= 200 && res.status < 300) {
                    if (res.data.data.status == "cancel") {
                        $location.path('/home');
                        return;
                    }
                    vm.setActiveQuote(res.data.data);
                    vm.showPaymentTab();
                }
            }).catch(function (error) {
                $scope.loading = false;
                if (error.status == 403 || error.status == 401) {
                    errorHandler.handle403();
                    return;
                }
                errorToasts.evaluateErrors(error.data);
            });
        };

        vm.getCompanyBankAccount = function () {
            // $scope.loading = true;
            $http.get(environmentConfig.API + '/company/bank-account/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.data.data.length > 0)
                    $scope.companyBankData = res.data.data[0].bank_account;
                else
                    toastr.error("Please contact the admin to get bank details.");
                $scope.loading = false;
            }).catch(function (error) {
                $scope.loading = false;
                if (error.status == 403) {
                    errorHandler.handle403();
                    return;
                }
                errorToasts.evaluateErrors(error.data);
            });
        };

        vm.findIndexOfBankAccount = function (element) {
            return this.id == element.id;
        };

        $scope.getSelectedAccount = function () {
            var result = $.grep($scope.bankAccounts, function (e) {
                return e.id == $scope.selected_account;
            });
            return result.length == 0 ? {} : result[0];
        }

        $scope.openBankAccountModal = function (page, size, bankAccount) {
            vm.theModal = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                controller: 'BankAccountModalCtrl',
                scope: $scope,
                resolve: {
                    bankAccount: function () {
                        return bankAccount;
                    }
                }
            });

            vm.theModal.result.then(function (bankAccount) {
                var index = $scope.bankAccounts.findIndex(vm.findIndexOfBankAccount, bankAccount);
                $scope.bankAccounts.splice(index, 1);
            }, function () {
            });
        };

    }

})();


