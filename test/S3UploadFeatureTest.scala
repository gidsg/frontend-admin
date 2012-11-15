package test

import org.scalatest.{GivenWhenThen, FeatureSpec}

import java.util.UUID
import tools.S3
import org.scalatest.matchers.ShouldMatchers

class S3UploadFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  feature("Front configuration"){

    scenario("upload config to S3"){

      val s3 = new S3 {
        override lazy val configKey = "TESTING/config/front.json"
        override lazy val switchesKey = "TESTING/config/switches.properties"
      }

      given("I save the config")
      val unique =  UUID.randomUUID().toString
      s3.putConfig(unique)

      then("The configuration should be saved to S3")
      s3.getConfig should be (Some(unique))
    }

    scenario("No config avaliable"){

      given("I attempt to get the config from S3")
      and("no config is available")
      val s3 = new S3 {
        override lazy val configKey = "TESTING/config/dummy.json"
      }

      then("I should not see an error")
      s3.getConfig should be (None)
    }
  }

  feature("Switchboard") {
    scenario("upload switchboard") {
      val s3 = new S3 {
        override lazy val configKey = "TESTING/config/front.json"
        override lazy val switchesKey = "TESTING/config/switches.properties"
      }

      val unique =  UUID.randomUUID().toString
      s3.putSwitches(unique)

      then("The switchboard should be saved to S3")
      s3.getSwitches should be (Some(unique))
    }
  }

  scenario("No switchboard avaliable"){

    given("I attempt to get the switchboard from S3")
    and("no switchboard is available")
    val s3 = new S3 {
      override lazy val configKey = "TESTING/config/dummy.json"
      override lazy val switchesKey = "TESTING/config/dummy.properties"
    }

    then("I should not see an error")
    s3.getSwitches should be (None)
  }
}
