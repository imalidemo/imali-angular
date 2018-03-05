#!/usr/bin/env bash

set -e

perl -pi -e 's/\{\{API_URL\}\}/$ENV{'API_URL'}/g' /usr/share/nginx/html/scripts/*
perl -pi -e 's/\{\{EXCHANGE_API_URL\}\}/$ENV{'EXCHANGE_API_URL'}/g' /usr/share/nginx/html/scripts/*
perl -pi -e 's/\{\{COMPANY_IDENTIFIER\}\}/$ENV{'COMPANY_IDENTIFIER'}/g' /usr/share/nginx/html/scripts/*

exec "$@"
