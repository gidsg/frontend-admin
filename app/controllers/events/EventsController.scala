package controllers.event

import play.api.mvc._
import tools.EventPersistence
import conf._
import controllers.AuthLogging
import play.api.libs.json.JsObject
import play.api.libs.json.Json.toJson
import model.Event

object EventsController extends Controller with EventPersistence with Logging with AuthLogging {

  val badRequest = BadRequest(toJson(Map("status" -> "Invalid Json")))

    def render() = Action{
    Ok(views.html.events("{}", Configuration.stage))
  }

  def list() = Action {
    Ok(Json(listEvents))
  }

  //TODO AuthAction
  def save() = Action{ request =>
    request.body.asJson.map{
      case json: JsObject =>
        try {
          val event = Event((json \ "event").as[JsObject])
          Ok(Json(saveEvent(event)))
        } catch { case e =>
          log.error("Error saving event", e)

          //todo error not bad request
          BadRequest(toJson(Map("status" -> e.getMessage)))
        }
      case _ => badRequest
    }.getOrElse(badRequest)
  }

  //TODO AuthAction
  def load(eventId: String) = Action{
    loadEvent(eventId).map{e => Ok(Json(e))}.getOrElse(NotFound)
  }

  private def Json(event: Event): String = com.codahale.jerkson.Json.generate(Map("event" -> event.asMap))

  private def Json(events: Seq[Event]): String = com.codahale.jerkson.Json.generate(Map("events" -> events.map(_.asMap)))

}
