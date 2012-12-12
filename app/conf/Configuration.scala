package conf

import com.gu.conf.ConfigurationFactory
import com.gu.management._
import logback.LogbackLevelPage
import play.{Management => GuManagement}
import java.net.{HttpURLConnection, URL}
import tools.Environment

object Configuration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  val stage = new Environment("/etc/gu/install_vars").getProperty("STAGE", "unknown")

  object aws {
    lazy val accessKey = configuration.getStringProperty("aws.access.key").getOrElse(throw new RuntimeException("AWS access key not set"))
    lazy val secretKey = configuration.getStringProperty("aws.access.secret.key").getOrElse(throw new RuntimeException("AWS secret key not set"))
    lazy val bucket = configuration.getStringProperty("aws.bucket").getOrElse(throw new RuntimeException("AWS bucket is not setup"))
  }

  lazy val configKey = configuration.getStringProperty("config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))
  lazy val switchesKey = configuration.getStringProperty("switches.file").getOrElse(throw new RuntimeException("Switches file name is not setup"))

  object api {
    lazy val host = configuration.getStringProperty("content.api.host") getOrElse {
      throw new IllegalStateException("Content Api Host not configured")
    }

    lazy val key = configuration.getStringProperty("content.api.key") getOrElse {
      throw new IllegalStateException("Content Api Key not configured")
    }
  }

  object healthcheck {
      lazy val properties = configuration.getPropertyNames filter {
        _ matches """healthcheck\..*\.url"""
      }

      lazy val urls = properties map { property =>
        configuration.getStringProperty(property).get
      }
    }
}

object ConfigUpdateCounter extends CountMetric("actions", "config_updates", "Config updates", "number of times config was updated")
object ConfigUpdateErrorCounter extends CountMetric("actions", "config_update_errors", "Config update errors", "number of times config update failed")

object SwitchesUpdateCounter extends CountMetric("actions", "switches_updates", "Switches updates", "number of times switches was updated")
object SwitchesUpdateErrorCounter extends CountMetric("actions", "switches_update_errors", "Switches update errors", "number of times switches update failed")


object Management extends GuManagement {

  val applicationName = "frontend-admin"

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage("http://localhost:9000/login"),
    StatusPage(applicationName,
      Seq(ConfigUpdateCounter, ConfigUpdateErrorCounter, SwitchesUpdateCounter, SwitchesUpdateErrorCounter)
    ),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
