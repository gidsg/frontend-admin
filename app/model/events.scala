package model

import com.novus.salat._
import json.{StringDateStrategy, JSONConfig}
import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._
import tools.Mongo.Events


case class Parent(id: String, title: Option[String] = None)
case class Content(id: String, importance: Int)

case class Event(
  id: String,
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[Content] = Nil,
  parent: Option[Parent] = None,
  ancestor: Option[Parent] = None
)

object Event {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  RegisterConversionHelpers()
  RegisterJodaTimeConversionHelpers()

  def fromJson(json: String) = grater[Event].fromJSON(json)
  def toJsonString(e: Event) = grater[Event].toPrettyJSON(e)

  def toDbObject(e: Event) = grater[Event].asDBObject(e)
  def fromDbObject(e: DBObject) = grater[Event].asObject(e)

  def toJsonList(e: Seq[Event]) = grater[Event].toPrettyJSONArray(e)


  object mongo {

    def byId(eventId: String): Option[Event] = Events.findOne(Map("id" -> eventId)).map{ fromDbObject }

    def save(event: Event) { Events.insert(toDbObject(event)) }

    def delete(eventId: String) = {
      val deleteOk = Events.remove(Map("id" -> eventId)).getLastError.ok()

      // make sure any child events have their parent updated
      Events.update(
        Map("parent.id" -> eventId),
        $unset("parent"),
        multi = true
      )

      // make sure any child events have their ancestor removed
      //todo might need to rethink this later
      Events.update(
        Map("ancestor.id" -> eventId),
        $unset("ancestor"),
        multi = true
      )

      deleteOk
    }

    def update(event: Event, eventId: Option[String] = None) = {

      //we may actually be updating the id, in which case we need to update using the old id
      val idToUpdate = eventId.getOrElse(event.id)

      val parentEvent = event.parent.flatMap(p => byId(p.id))
      val eventWithParent = event.copy(parent = parentEvent.map(p => Parent(p.id, Some(p.title))))

     val updateOk = Events.update(Map("id" -> idToUpdate), Event.toDbObject(eventWithParent), upsert = false)
       .getLastError.get("updatedExisting").asInstanceOf[Boolean]

      // make sure any child events have their parent updated
      Events.update(
        Map("parent.id" -> idToUpdate),
        $set("parent.id" -> event.id, "parent.title" -> event.title),
        multi = true
      )

      // make sure any related events have their ancestor updated
      Events.update(
        Map("ancestor.id" -> idToUpdate),
        $set("ancestor.id" -> event.id),
        multi = true
      )

      updateOk
    }
  }
}