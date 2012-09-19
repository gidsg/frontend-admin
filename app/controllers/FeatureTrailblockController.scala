package controllers

import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.S3

import play.api.libs.json.Json
import play.api.libs.json.Json.toJson

object FeatureTrailblockController extends Controller {



  def edit() = AuthAction{
    val promiseOfConfig = Akka.future(S3.getConfig)
    Async{
      promiseOfConfig.map(config => Ok(views.html.edit(config)))
    }
  }

  def save() = AuthAction{ request =>

    request.body.asJson.map { json =>
      Akka.future{
        try {
          S3.putConfig(Json.stringify(json))
          Ok(toJson(Map("status" -> "Configuration updated")))
        } catch { case e =>
            //TODO log error
            InternalServerError(toJson(Map("status" -> e.getMessage)))
        }
      }
    } map { result => Async { result }
    } getOrElse(BadRequest(toJson(Map("status" -> "Invalid Json"))))
  }
}