(function () {
    'use strict';

    angular.module('BlurAdmin.pages.quote')
        .controller('QuoteCtrl', QuoteCtrl);

    /** @ngInject */
    function QuoteCtrl($scope, $stateParams,currencyModifiers, environmentConfig, $timeout, $uibModal, toastr, $http, $location, cookieManagement, errorToasts, $window, errorHandler) {

        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $scope.selected_account = -1;
        $scope.tab = "bank";
        $scope.loading = true;
        $scope.loadingActiveQuotes = true;
        $scope.newBankData = {};
        $scope.companyBankData = {};
        $scope.active_quote = {};
        $scope.bankAccounts = [{id: -1, bank_name: "Add new account", number: ""}, {
            id: 1,
            bank_name: "Coparts",
            number: ""
        }];
        $scope.from_quote = false

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

        vm.showPaymentTab = function (quote) {
            $scope.tab = "payment";
            vm.getCompanyBankAccount(quote);
        }

        vm.setActiveQuote = function (quote) {
            $scope.to_currency = quote;
            console.log($scope.to_currency);
            $scope.from_amount=$scope.to_currency.from_amount* (-1);
            /*$scope.from_amount = ($scope.to_currency.from_amount* (-1))/100*/
            /*$scope.to_amount=$scope.to_currency.to_amount/100*/
            $scope.to_amount=$scope.to_currency.to_amount;
            $scope.from_currency = quote.from_currency.code;
            $scope.active_quote = quote;

            $scope.loadingActiveQuotes = false;
            if (quote.metadata.bank) {
                vm.showPaymentTab(quote);
            }
            else {

            }
        }

        vm.getActiveQuotes = function () {
            $http.get(environmentConfig.EXCHANGE_API + '/user/quotes/' + $stateParams.quote_id, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.data.data.length == 0)
                    $location.path('/transactions');
                else{
                    vm.setActiveQuote(res.data.data);
                }
            }).catch(function (error) {
                $scope.loadingActiveQuotes = false;
                if (error.status == 403) {
                    errorHandler.handle403();
                    return;
                }
                errorToasts.evaluateErrors(error.data);
            });

        }
        if ($stateParams.quote_id) {
            $scope.from_quote = true
            vm.getActiveQuotes()
        } else {
            $scope.from_quote = false
            $scope.to_currency = $stateParams.to_currency
            $scope.active_quote = $stateParams.to_currency
        }

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
                            {
                                id: -2,
                                recipient: 'manheim@imali.io',
                                name: 'Manheim',
                                bank_name: 'Wells Fargo',
                                number: '2080000698511',
                                swift: 'WFBIUS6S',
                                aba: '121000248'
                            },
                            {
                                id:-3,
                                recipient: 'copart@imali.io',
                                name: 'Copart, Inc. Member Wire Account',
                                bank_name: 'Wells Fargo',
                                number: '4114145394',
                                aba: '121000248',
                                swift: 'WFBIUS6S',
                                bank_address: 'Wells Fargo Bank, 420 Montgomery Street 7th Floor San Francisco, CA 94104'
                            }
                        ]
                        $scope.bankAccounts.splice(0, 0, item[0], item[1], item[2]);
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
                $scope.modifyQuote({bank: res.data.data, recipient: $scope.newBankData.recipient,extra: $scope.newBankData.extra});
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
            delete data["$$hasKey"];
            var quote_id = $scope.active_quote.id;
            console.log(data);
            if(!data.recipient && data.status!='cancel'){
                data.recipient = data.bank.recipient;
            }
            $scope.loading = true;
            $http.patch(environmentConfig.EXCHANGE_API + '/user/quotes/' + quote_id + "/", {recipient:data.recipient , metadata:data}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if (res.status >= 200 && res.status < 300) {
                    var metadata=res.data.data.metadata
                    if (metadata.status == "cancel") {
                        $location.path('/home');
                        return;
                    }
                    vm.setActiveQuote(res.data.data);
                    vm.showPaymentTab(res.data.data);
                    vm.createTransaction(res.data.data,quote_id,data);
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

        vm.createTransaction=function (quote_response,quote_id,metadata) {
            var metadata1={
                quote_id:quote_id,
                quote:quote_response,
                recipient:metadata.email
            }
            var data = {
                "amount": ($scope.to_currency.from_amount*(-1)),
                "currency": "NGN",
                "reference": metadata1.recipient,
                "metadata": metadata1
            }
            $http.post(environmentConfig.API + '/transactions/credit/', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                if(res.status==='success'){
                    toastr.success('Transaction successfull')
                }
            });
        }

        vm.getCompanyBankAccount = function (quote) {
            $http.get(environmentConfig.API + '/company/bank-account/', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vm.token
                }
            }).then(function (res) {
                $scope.loading = false;
                if(res.data.data.length>0){
                    $scope.companyBankData = res.data.data[0].bank_account;
                    $scope.companyBankData.reference = res.data.data[0].reference;
                }
                else{
                    toastr.error("Please contact the admin to get bank details.");
                }
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


