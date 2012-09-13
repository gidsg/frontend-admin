package conf

import com.gu.conf.ConfigurationFactory


object Configuration {
  val configuration = ConfigurationFactory.getConfiguration("frontend-admin", "env")

  object api {
    lazy val key = configuration.getStringProperty("content.api.key").getOrElse(throw new RuntimeException("needs an api key"))
  }
}
