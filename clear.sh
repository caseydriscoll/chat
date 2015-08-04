#!/bin/bash

wp db drop --yes
wp db create
wp core install
wp plugin activate patchchat
