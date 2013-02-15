package model

import com.novus.salat._
import json.{StringDateStrategy, JSONConfig}
import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._
import tools.Mongo.Entities
import com.mongodb

case class Entity(
    id: String,
    name: String,
    country: String,
    population: String,
    coords: String
)

object Entity {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  RegisterConversionHelpers()
  RegisterJodaTimeConversionHelpers()

  def fromJson(json: String) = grater[Entity].fromJSON(json)
  def toJsonString(s: Entity) = grater[Entity].toPrettyJSON(s)

  def toDbObject(s: Entity) = grater[Entity].asDBObject(s)
  def fromDbObject(s: DBObject) = grater[Entity].asObject(s)

  def toJsonList(s: Seq[Entity]) = grater[Entity].toPrettyJSONArray(s)

  object mongo {
    def createNew(entity: Entity) = {
      Entities.insert(toDbObject(entity)).getLastError.ok()
      entity
    }

    def update(entityId: String, entity: Entity) = {
      Entities.update(Map("id" -> entityId), toDbObject(entity), upsert = false)
      entity
    }

    def delete(entityId: String) = Entities.remove(Map("id" -> entityId)).getLastError().ok()

    def get(id: String) = Entities.findOne(Map("id" -> id)).map(fromDbObject)

  }
}
