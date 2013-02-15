package controllers.event

import play.api.mvc._
import conf._
import controllers.{AuthenticatedRequest, AuthAction, AuthLogging}
import play.api.libs.json.Json.toJson
import model.{Modified, Entity}
import org.joda.time.DateTime

object EntityController extends Controller with Logging with AuthLogging {

  def create() = AuthAction{ request =>

    request.body.asJson.map(_.toString).map(Entity.fromJson)
      .map(entity => Ok(Entity.toJsonString(Entity.mongo.createNew(entity))).as("application/json"))
      .getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
  }

  def update(entityId: String) = AuthAction{ request =>
    // entityId has leading /
    Entity.mongo.get(entityId.drop(1)).map{ oldEntity =>
      request.body.asJson.map(_.toString).map(Entity.fromJson)
        .map(entity => Ok(Entity.toJsonString(Entity.mongo.update(oldEntity.id, entity))).as("application/json"))
        .getOrElse(BadRequest(status("Invalid Json")).as("application/json"))
    }.getOrElse(NotFound)
  }

  def delete(entityId: String) = AuthAction{ request =>
    // entityId will have leading /
    Entity.mongo.delete(entityId.drop(1))
    Ok(status("deleted: " + entityId)).as("application/json")
  }

  def read(entityId: String) = AuthAction{ request =>
    // entityId will have leading /
    Entity.mongo.get(entityId.drop(1)).map{ entity =>   Ok(Entity.toJsonString(entity)) }
      .getOrElse(NotFound(status("no entity found: " + entityId)).as("application/json"))
  }
  
  def status(msg: String) = toJson(Map("status" -> msg))
}
