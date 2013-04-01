Fronted Admin - Network Front Tool
==================================

Testing
-------

### Usage

    $ mvn clean test

#### Optional params:

 * `host`: host to connect to, defaults to localhost:9000
 * `google.username`: google user to log in as
 * `google.password`: password for google account
 * `proxyname`: host of proxy server
 * `proxyport`: port of proxy server
 
e.g.

    $ mvn clean test -Dhost=http://host.co.uk -Dproxyname=proxy.co.uk -Dproxyport=1234 -Dgoogle.username=google.user@gmail.com -Dgoogle.password=password1234
