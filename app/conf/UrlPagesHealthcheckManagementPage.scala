package conf

import java.util.concurrent.TimeUnit
import play.api.libs.concurrent.Promise
import play.api.libs.ws.WS
import com.gu.management.ManagementPage
import com.gu.management.HttpRequest
import com.gu.management.PlainTextResponse
import com.gu.management.ErrorResponse

class UrlPagesHealthcheckManagementPage(val urls: String*) extends ManagementPage with Logging {
  val path = "/management/healthcheck"

  def get(req: HttpRequest) = {
    val checks = urls map { url =>
      log.info("Healthcheck: Checking " + url)

      // if this is giving a 503 when running locally you want to run with no proxy ./sbt011 --no-proxy
      WS.url(url).get() map { response => url -> response }
    }

    val sequenced = Promise sequence checks // List[Promise[...]] -> Promise[List[...]]
    val failed = sequenced map { _ filter { _._2.status / 100 != 2 } }

    failed.await(10, TimeUnit.SECONDS).get match {
      case Nil =>
        log.info("Healthcheck OK")
        PlainTextResponse("OK")

      case failures =>
        val message = failures map {
          case (url, response) =>
            log.info("Healthcheck FAIL: %s (%s)".format(url, response.status))
            "FAIL: %s (%s)".format(url, response.status)
        }
        ErrorResponse(503, message mkString "\n")
    }
  }
}
