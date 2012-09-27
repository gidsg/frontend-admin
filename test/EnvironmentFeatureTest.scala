package test

import org.scalatest.{GivenWhenThen, FeatureSpec}

import tools.Environment
import org.scalatest.matchers.ShouldMatchers
import java.io.File

class EnvironmentFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Environment"){

    scenario("Reading the STAGE property"){

      given("I load the Guardian environment properties")
      val env = new Environment("test/resources/etc/gu/install_vars")

      then("the 'stage' configuration should be set to the current environment")
      env.getProperty("STAGE", "unknown") should be ("foo")
    }

    scenario("Missing properties"){

      given("I load the Guardian environment properties")
      val env = new Environment("missing_conf")
      
      and("the desired configuration is missing")
      
      then("the property  should be set to 'unknown'")
      env.getProperty("foo", "unknown") should be ("unknown")
    }

  }
}



