(function () {
    'use strict';

    angular.module('BlurAdmin.pages.send')
        .controller('RegisterProgressCtrl', RegisterProgressCtrl);

    /** @ngInject */
    function RegisterProgressCtrl($rootScope,$scope,$http,cookieManagement,environmentConfig,$location,errorToasts,userVerification) {

        var vm = this;
        vm.token = cookieManagement.getCookie('TOKEN');
        $rootScope.allVerified = false;
        $rootScope.loadingRegisterProgressView = true;
        $rootScope.emailVerified = false;
        $rootScope.mobileVerified = false;
        $rootScope.addressVerified = "n";
        $rootScope.idDocumentsVerified = 'n';

        $scope.goToGetVerified = function (path) {
            $location.path(path);
        };

        vm.getUserInfo = function(){
            if(vm.token){
                $scope.loadingRegisterProgressView = true;
                $http.get(environmentConfig.API + '/user/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        $scope.user = res.data.data;
                        console.log($scope.user)
                        if($scope.user.kyc.status=='verified'){
                            $rootScope.allVerified=true
                            $location.path('/home');
                        }
                        else {
                            vm.checkingEmailVerfication(res.data.data.email);
                            if($scope.user.status =='verified') {
                                $rootScope.addressVerified = "v";
                            }
                            else if($scope.user.status =='pending') {
                                $rootScope.addressVerified = "p";
                                return;
                            }
                            else {
                                return;
                            }

                            $http.get(environmentConfig.API + '/user/address/', {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': vm.token
                                }
                            }).then(function (res) {
                                if (res.status === 200) {
                                    $scope.address = res.data.data;
                                    if(!$scope.address.line_1 || !$scope.address.city || !$scope.address.country || !$scope.address.postal_code){
                                        $scope.goToGetVerified("/identity/verification");
                                    }
                                    if($scope.address.status =='verified') {
                                        $rootScope.addressVerified = "v";
                                        if($rootScope.emailVerified == true && $rootScope.mobileVerified == true && $rootScope.addressVerified=="v" && $rootScope.idDocumentsVerified=='v'){
                                            $scope.allVerified = true;
                                        }
                                    }
                                    else if($scope.address.status =='pending') {
                                        $rootScope.addressVerified = "p";
                                    }
                                }
                            }).catch(function (error) {
                                $scope.loadingRegisterProgressView = false;
                                errorToasts.evaluateErrors(error.data);
                            });
                        }
                        
                    }

                }).catch(function (error) {
                    $scope.loadingRegisterProgressView = false;
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };
        vm.getUserInfo();

        vm.checkingEmailVerfication = function (email) {
            $scope.loadingRegisterProgressView = true;
            userVerification.verifyEmail(function(err,verified){
                if(verified){
                    $rootScope.emailVerified = true;
                    if($scope.user.mobile_number==null || $scope.user.mobile_number.length==0){
                        $scope.goToGetVerified("/mobile/verify");
                    }
                    vm.checkingMobileVerification($scope.user.mobile_number);
                } else {
                    $scope.goToGetVerified("/email/verify");
                    $rootScope.emailVerified = false;
                    $scope.loadingRegisterProgressView = false;
                }
            },email);
        };

        vm.checkingMobileVerification = function (number) {
            $scope.loadingRegisterProgressView = true;
            userVerification.verifyMobile(function(err,verified){
                if(verified){
                    $rootScope.mobileVerified = true;
                    if($rootScope.emailVerified == true && $rootScope.mobileVerified == true && $rootScope.addressVerified=="v" && $rootScope.idDocumentsVerified=="v"){
                        $scope.allVerified = true;
                    }
                    $scope.loadingRegisterProgressView = false;
                } else {
                    $rootScope.mobileVerified = false;
                    $scope.goToGetVerified("/mobile/verify");
                    $scope.loadingRegisterProgressView = false;
                }
                
            vm.getUserDocuments();
            },number);
        };

        vm.getUserDocuments = function(){
            if(vm.token) {
                $http.get(environmentConfig.API + '/user/documents/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': vm.token
                    }
                }).then(function (res) {
                    if (res.status === 200) {
                        $scope.idDocuments = res.data.data.results.filter(function (element) {
                            return element.document_category == 'Proof Of Identity';
                        });
                        if($scope.idDocuments.length==0){
                            $scope.goToGetVerified("/document/verify/ID")
                        }
                        $rootScope.idDocumentsVerified = vm.checkDocumentsArrayVerification($scope.idDocuments);
                        if($rootScope.emailVerified == true && $rootScope.mobileVerified == true && $rootScope.addressVerified==true && $rootScope.idDocumentsVerified=='v'){
                            $scope.allVerified = true;
                        }
                    }
                }).catch(function (error) {
                    $scope.loadingRegisterProgressView = false;
                    errorToasts.evaluateErrors(error.data);
                });
            }
        };

        vm.checkDocumentsArrayVerification = function(documentsArray){
            if(documentsArray.length === 0){
                return 'n';
            } else {
                for(var i = 0; i < documentsArray.length; i++){
                    if(documentsArray[i].status === 'verified'){
                        return 'v';
                    }
                }
                for(var i = 0; i < documentsArray.length; i++){
                    if(documentsArray[i].status === 'pending'){
                        return 'p';
                    }
                }
                for(var i = 0; i < documentsArray.length; i++){
                    if(documentsArray[i].status === 'declined'){
                        return 'd';
                    }
                }
            }
            return 'n';
        };
        

    }
})();
