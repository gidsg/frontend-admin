package controllers.event

import play.api.mvc._
import tools.DynamoDB
import play.api.libs.json._
import conf._
import controllers.AuthLogging
import play.api.libs.json.JsObject
import play.api.libs.json.JsString
import play.api.libs.json.Json.toJson

object EventController extends Controller with Logging with AuthLogging {

  val badRequest = BadRequest(toJson(Map("status" -> "Invalid Json")))

  //TODO per stage event tables
  lazy val eventTable = "dev_event"

  //TODO AuthAction
  def save() = Action{ request =>
    request.body.asJson.map{
      case json: JsObject =>
        try {
          saveEvent((json \ "event").as[JsObject])
          Ok(toJson(Map("status" -> "Event updated")))
        } catch { case e =>
          BadRequest(toJson(Map("status" -> e.getMessage)))
        }
      case _ => badRequest
    }.getOrElse(badRequest)
  }

  //TODO AuthAction
  def load(eventId: String) = Action{
   val properties = DynamoDB.get(eventTable, "/" + eventId)
   Ok(com.codahale.jerkson.Json.generate(Map("event" -> properties)))
  }

  private def saveEvent(json: JsObject) {
    val properties = json.value.map {
      case (key, value) =>
        value match {
          case JsString(s) => key -> s
          case JsNumber(n) => key -> n.toLongExact //throws error if you are going to lose something
          case _ => throw new IllegalStateException("did not understand value: " + value)
        }
    }.toMap

    DynamoDB.put(eventTable, properties)
  }
}