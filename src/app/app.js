'use strict';

angular.module('BlurAdmin', [
    'ngFileUpload',
    'ngCookies',
    'ngAnimate',
    'ui.bootstrap',
    'ui.sortable',
    'ui.router',
    'ngTouch',
    'toastr',
    'smart-table',
    "xeditable",
    'ui.slimscroll',
    'ngJsTree',
    'countrySelect',
    'angular-progress-button-styles',
    'iso-3166-country-codes',

    'BlurAdmin.theme',
    'BlurAdmin.pages'
])

    //.constant('API', 'http://127.0.0.1:8000/api/3')
    .constant('API', 'https://rehive.com/api/3')

    .run(function($cookies,$rootScope,cookieManagement,userVerification,$location,_){

        //using to check if user has a verified email address
        $rootScope.userVerified = true;


        var locationChangeStart = $rootScope.$on('$locationChangeStart', function (event,newUrl) {

            userVerification.verify(function(err,verified){
                if(verified){
                    $rootScope.userVerified = true;
                    routeManagement(event,newUrl);
                } else {
                    $rootScope.userVerified = false;
                    routeManagement(event,newUrl);
                }
            });


        });

        function routeManagement(event,newUrl){
            var token = cookieManagement.getCookie('TOKEN'),
                newUrlArray = newUrl.split('/'),
                newUrlLastElement = _.last(newUrlArray);

            //using to check if user is in changing password or setting up 2 factor authentication
            $rootScope.securityConfigured = true;

            if(token) {
                $rootScope.gotToken = true;
            } else if(newUrlLastElement == 'register' || newUrlLastElement == 'reset' || newUrlLastElement == 'verification'
                || newUrlLastElement == 'name_request'){
                // do nothing
            } else {
                $rootScope.gotToken = false;
                $location.path('/login');
            }

            //checking if changing password or setting up 2 factor authentication
            if(newUrlLastElement == 'change' || newUrlLastElement == 'two-factor'){
                $rootScope.securityConfigured = false;
            }
        }
    });


