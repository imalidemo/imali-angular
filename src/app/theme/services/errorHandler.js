(function () {
    'use strict';

    angular.module('BlurAdmin.theme')
        .factory('errorHandler', errorHandler);

    /** @ngInject */
    function errorHandler(toastr,$location) {

        return {
            evaluateErrors: function (errors) {
                if(errors && errors.data){
                    for(var key in errors.data){
                        if (errors.data.hasOwnProperty(key)) {
                            errors.data[key].forEach(function(error){
                                if(key == 'non_field_errors'){
                                    key = 'error';
                                }
                                toastr.error(error, (key.charAt(0).toUpperCase() + key.slice(1)));
                            })
                        }
                    }
                } else{
                    if(errors && errors.message){
                        toastr.error(errors.message, 'Message');
                    } else {
                        toastr.error('Something went wrong, please check your internet connection or try again', 'Message');
                    }
                }
            },
            handleErrors: function(errors){
                if(errors && errors.status){
                    if(errors.status == 401){
                        $location.path('/login');
                    }
                }
            },
            handle403: function(){
                $location.path('/login');
            }
        }
    }

})();
