package controllers.event

import play.api.mvc._
import conf._
import controllers.{AuthenticatedRequest, AuthAction, AuthLogging}
import play.api.libs.json.Json.toJson
import model.{Modified, Story}
import org.joda.time.DateTime

object StoryController extends Controller with Logging with AuthLogging {


  def find(title: String) = AuthAction{ request =>
    val results = if (title == "") Story.mongo.latest else Story.mongo.find(title)
    Ok(Story.toJsonList(results)).as("application/json")
  }

  def create() = AuthAction{ request =>

    val created = Modified(request.asInstanceOf[AuthenticatedRequest[AnyContent]].identity.get.email, new DateTime)

    request.body.asJson.map(_.toString).map(Story.fromJson)
      .map(_.copy(createdBy = Some(created), modifiedBy = Seq(created)))
      .map(story => Ok(Story.toJsonString(Story.mongo.createNew(story))).as("application/json"))
      .getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  def update(storyId: String) = AuthAction{ request =>
    // storyId has leading /
    Story.mongo.get(storyId.drop(1)).map{ oldStory =>
      val modified = Modified(request.asInstanceOf[AuthenticatedRequest[AnyContent]].identity.get.email, new DateTime)

      request.body.asJson.map(_.toString).map(Story.fromJson)
        .map(_.copy(createdBy = oldStory.createdBy, modifiedBy = (oldStory.modifiedBy ++ Seq(modified))))
        .map(story => Ok(Story.toJsonString(Story.mongo.update(oldStory.id, story))).as("application/json"))
        .getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
    }.getOrElse(NotFound)
  }

  def delete(storyId: String) = AuthAction{ request =>
    // storyId will have leading /
    Story.mongo.delete(storyId)
    Ok(status("deleted: " + storyId)).as("application/json")
  }

  def read(storyId: String) = AuthAction{ request =>
    // storyId will have leading /
    Story.mongo.get(storyId.drop(1)).map{ story =>   Ok(Story.toJsonString(story)) }
      .getOrElse(NotFound(status("no story found: " + storyId)).as("application/json"))
  }
  
  def status(msg: String) = toJson(Map("status" -> msg))
}
