Fronted Admin - Network Front Tool
==================================

Testing
-------

### Usage

    $ mvn clean test

#### Optional params:

 * host: host to connect to, defaults to localhost:9000
 * google.username: google user to log in as
 * google.password: password for google account
 * http_proxy: proxy for broswer to user
 
e.g.

    $ -Dhost=http://host.co.uk -Dhttp_proxy=http://proxy.co.uk:1234 -Dgoogle.username=google.user@gmail.com -Dgoogle.password=password1234