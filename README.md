# Rehive Angular admin dashboard

### Dashboard | Management and operations

Rehive's dashboard is designed to help you manage your product from end-to-end:
* invite new users, collect KYC documents, verify user information,
* clear deposits and withdrawals, manage and review transactions,
* manage customer support,
* set transaction fees, set transaction limits, set notification preferences,
* configure employee and user permissions
* and more.

### Open-source

Rehive's back office dashboard is an open sourced project in Angular JS which advanced users can host in order to extend functionality.

### Getting started

* fork the repository
* git clone  `https://github.com/{{username}}/dashboard-angular.git`,
* cd into `dashboard-angular`
* run `npm install` to install the dependencies,
* to run local copy in development mode, execute: `gulp serve`,
* to run local copy in staging mode, with the rehive staging API (`https://api.staging.rehive.com/api/3`), execute: `gulp serve:staging`,
* to run local copy in production mode, execute: `gulp serve:dist`.

### Deployment
* commit all changes
* run `inv git_release` to increment the version and tag the release
* wait for the build trigger or run `inv cloudbuild <version>` to build and upload the latest docker image
* run `inv upgrade production` to add the latest image to kubernetes deployment

### Where can I learn more ?

Check us out at [Rehive](http://www.rehive.com/)

License
-------------
<a href=/LICENSE.txt target="_blank">MIT</a> license.
