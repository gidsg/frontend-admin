package conf

import com.gu.conf.ConfigurationFactory
import com.gu.management._
import logback.LogbackLevelPage
import play.{Management => GuManagement}
import java.net.{HttpURLConnection, URL}


object Configuration {

  val configuration = ConfigurationFactory.getConfiguration("frontend-admin", "env")

  object aws {
    lazy val accessKey = configuration.getStringProperty("aws.access.key").getOrElse(throw new RuntimeException("AWS access key not set"))
    lazy val secretKey = configuration.getStringProperty("aws.secret.access.key").getOrElse(throw new RuntimeException("AWS secret key not set"))
    lazy val bucket = configuration.getStringProperty("aws.bucket").getOrElse(throw new RuntimeException("AWS bucket is not setup"))
  }

  lazy val configKey = configuration.getStringProperty("config.file").getOrElse(throw new RuntimeException("Config file name is not setup"))

  object api {
    lazy val key = configuration.getStringProperty("content.api.key").getOrElse(throw new RuntimeException("needs an api key"))
  }
}

object ConfigUpdateCounter extends CountMetric("actions", "config_updates", "Config updates", "number of times config was updated")
object ConfigUpdateErrorCounter extends CountMetric("actions", "config_update_errors", "Config update errors", "number of times config update failed")

object HealthCheck extends ManagementPage {

  val path = "/management/healthcheck"

  def get(req: com.gu.management.HttpRequest) = {
    val connectionToFront = new URL("http://localhost:9000/admin/edit").openConnection().asInstanceOf[HttpURLConnection]
    try {
      connectionToFront.getResponseCode match {
        case 200 => PlainTextResponse("Ok")
        case other => ErrorResponse(other, connectionToFront.getResponseMessage)
      }
    } finally {
      connectionToFront.disconnect()
    }
  }
}

object Management extends GuManagement {

  val applicationName = "frontend-admin"

  lazy val pages = List(
    new ManifestPage,
    HealthCheck,
    StatusPage(applicationName,
      Seq(ConfigUpdateCounter, ConfigUpdateErrorCounter)
    ),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
