Fronted Admin - Network Front Tool
==================================

Testing
-------
  To run maven using command line host, username (email) and password:
  
  mvn test "-Dhost=http://tools-COD-AdminLoa-1NNTS8YNET3DB-1257217998.eu-west-1.elb.amazonaws.com" "-Dgoogle.username=user.name@guardian.co.uk" "-Dgoogle.password=yourpassword"
  linux does not need the quote marks
  If host name is not specified tests will default to run on local host
  Additional parameters which are used by teamcity to run the tests through the proxy are:
  -Dproxyname=gudev.gnl
  The port is defaulted to 3128 