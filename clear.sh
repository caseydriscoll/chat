#!/bin/bash

wp db drop --yes
wp db create
wp core install

patchchatsetting='a:5:{s:8:"js-debug";s:2:"on";s:12:"spinner-icon";s:10:"fa-spinner";s:13:"minimize-icon";s:8:"fa-minus";s:21:"receive-message-sound";s:13:"alpha-one.mp3";s:18:"send-message-sound";s:13:"alpha-two.mp3";}'

wp db query "INSERT INTO wp_options (option_name,option_value) VALUES ('patchchat_settings','$patchchatsetting')" 

wp plugin activate patchchat
