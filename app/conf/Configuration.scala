package conf

import com.gu.conf.ConfigurationFactory
import com.gu.conf.impl.PropertiesLoader


object Configuration {

  val configuration = ConfigurationFactory.getConfiguration("frontend-admin", "env")

  object aws {
    lazy val accessKey = configuration.getStringProperty("aws.access.key").getOrElse(throw new RuntimeException("AWS access key not set"))
    lazy val secretKey = configuration.getStringProperty("aws.secret.access.key").getOrElse(throw new RuntimeException("AWS secret key not set"))
    lazy val bucket = configuration.getStringProperty("aws.bucket").getOrElse(throw new RuntimeException("AWS bucket is not setup"))
  }

  lazy val configFile = configuration.getStringProperty("config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))

  object api {
    lazy val key = configuration.getStringProperty("content.api.key").getOrElse(throw new RuntimeException("needs an api key"))
  }
}
