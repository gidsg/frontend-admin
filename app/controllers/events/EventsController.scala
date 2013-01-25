package controllers.event

import play.api.mvc._
import conf._
import controllers.{AuthAction, AuthLogging}
import play.api.libs.json.Json.toJson
import model.Event
import tools.Mongo.Events
import com.mongodb.casbah.Imports._

object EventController extends Controller with Logging with AuthLogging {

  def render() = AuthAction{ request =>
    Ok(views.html.events("{}", Configuration.stage))
  }

  def list() = AuthAction { request =>
    val results = Events.find().sort(Map("startDate" -> -1)).toSeq.map(Event.fromDbObject)
    Ok(Event.toJsonList(results)).as("application/json")
  }

  def create() = AuthAction{ request =>
    request.body.asJson.map(_.toString).map(Event.fromJson).map { event =>
      Events.insert(Event.toDbObject(event))
      Ok(Event.toJsonString(event)).as("application/json")
    }.getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  def update(eventId: String) = AuthAction{ request =>
    request.body.asJson.map(_.toString).map(Event.fromJson).map { event =>
      val result = Events.update(Map("id" -> eventId), Event.toDbObject(event), upsert = false)
      if (result.getLastError.get("updatedExisting").asInstanceOf[Boolean]) {
        Ok(Event.toJsonString(event)).as("application/json")
      } else {
        NotFound(status("no entity with id: " + eventId)).as("application/json")
      }
    }.getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  def load(eventId: String) = AuthAction{ request =>
    Events.findOne(Map("id" -> eventId)).map{ Event.fromDbObject }.map{ event =>   Ok(Event.toJsonString(event)) }
      .getOrElse(NotFound(status("no event found: " + eventId)).as("application/json"))
  }

  def status(msg: String) = toJson(Map("status" -> msg))
}
