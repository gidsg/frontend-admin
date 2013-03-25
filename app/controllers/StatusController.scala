package controllers

import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.S3
import play.api.libs.json.{JsValue, Json}
import play.api.libs.json.Json.toJson
import conf._

object StatusController extends Controller with Logging with AuthLogging {

  def summary() = AuthAction{ request =>
    val promiseOfConfig = Akka.future(S3.getConfig)

    Async{
      promiseOfConfig.map(config => Ok(views.html.status(config.getOrElse("{}"), Configuration.stage)))
    }
  }

}

