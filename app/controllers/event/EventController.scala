package controllers.event

import play.api.mvc._
import conf._
import controllers.AuthLogging
import play.api.libs.json.Json.toJson
import model.Event
import tools.Mongo.Events
import com.mongodb.casbah.Imports._

object EventController extends Controller with Logging with AuthLogging {


  def render() = Action{
    Ok(views.html.events("{}", Configuration.stage))
  }

  def list() = Action {
    val results = Events.find().sort(Map("startDate" -> -1)).toSeq.map(Event.fromDbObject)
    Ok(Event.toJsonList(results)).as("application/json")
  }

  //TODO AuthAction
  def create() = Action{ request =>
    request.body.asJson.map{ json =>
      val event = Event.fromJson((json \ "event").toString())
      Events.insert(Event.toDbObject(event))
      Ok(Event.toJsonString(event)).as("application/json")
    }.getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  //TODO AuthAction
  def update(eventId: String) = Action{ request =>
    request.body.asJson.map{ json =>
      val event = Event.fromJson((json \ "event").toString())
      val result = Events.update(Map("id" -> eventId), Event.toDbObject(event), upsert = false)
      if (result.getLastError.get("updatedExisting").asInstanceOf[Boolean]) {
        Ok(Event.toJsonString(event)).as("application/json")
      } else {
        NotFound(status("no entity with id: " + eventId)).as("application/json")
      }
    }.getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  //TODO AuthAction
  def load(eventId: String) = Action{
    Events.findOne(Map("id" -> eventId)).map{ Event.fromDbObject }.map{ event =>   Ok(Event.toJsonString(event)) }
      .getOrElse(NotFound(status("no event found: " + eventId)).as("application/json"))
  }

  def status(msg: String) = toJson(Map("status" -> msg))
}