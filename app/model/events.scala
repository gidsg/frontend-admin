package model

import com.novus.salat._
import json.{StringDateStrategy, JSONConfig}
import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._
import tools.Mongo.Events

case class Parent(id: String, title: Option[String] = None)
case class Content(id: String, importance: Int, colour: Int = 3)

// Agents are people and organisations who play a role in the story. We want to tell their backstory.
case class Agent(id: Option[String], name: Option[String] = None, explainer: Option[String] = None, sameAs: Seq[String] = Nil)

case class Event(
  id: String,
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[Content] = Nil,
  parent: Option[Parent] = None,
  _rootEvent: Option[Parent] = None, //denormalisation to group events together, represents event at the top of this tree
  createdBy: Option[String] = None,
  lastModifiedBy: Option[String] = None,
  agents: Seq[Agent] = Nil,
  explainer: Option[String] = None

    // Predicates :-
    //  mentions: Seq[Agent|Place] 
    //  isAbout: <-- attach to articles 

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

    def create(event: Event) = Events.insert(toDbObject(event)).getLastError.ok()

    def update(event: Event) = Events.update(Map("id" -> event.id),  toDbObject(event)).getLastError.ok()

    def createNew(event: Event) = {
      val eventWithParent = withUpdatedParent(event)
      Event.mongo.create(eventWithParent)
      eventWithParent
    }

    def delete(eventId: String) = {
      val deleteOk = Events.remove(Map("id" -> eventId)).getLastError.ok()

      //TODO somebody please think of the children
      // fix broken parents on child events  <------ MC perhaps just make ophans visible to the user?

      deleteOk
    }

    def update(event: Event, eventId: Option[String] = None) = {

      //we may actually be updating the id, in which case we need to update using the old id
      val idToUpdate = eventId.getOrElse(event.id)


      val eventWithParent = withUpdatedParent(event)

      val updateOk = Events.update(Map("id" -> idToUpdate), Event.toDbObject(eventWithParent), upsert = false)
       .getLastError.get("updatedExisting").asInstanceOf[Boolean]

      updateChildren(eventWithParent)

      updateOk
    }

    private def updateChildren(event: Event) {
      val children = Events.find(Map("parent.id" -> event.id)).map(fromDbObject)
      children.foreach{ child =>
        update(withUpdatedParent(child))
        updateChildren(child)
      }
    }

    private def withUpdatedParent(event: Event): Event = {
      val parentEvent = event.parent.flatMap(p => Event.mongo.byId(p.id))

      //rootId is a denormalisation. The idea is that each event inherits the rootId from the
      //very first item in the chain. It gives us easy access to the entire chain.
      //If there is no parent then use the current id
      val rootEventId = parentEvent.flatMap(_._rootEvent.map(_.id)) // the parent's root
        .orElse(parentEvent.map(_.id)) // or the parent's id
        .orElse(Some(event.id)) // or this event id

      val eventWithParent = event.copy(
        parent = parentEvent.map(p => Parent(p.id, Some(p.title))),
        _rootEvent = rootEventId.map(Parent(_))
      )
      eventWithParent
    }
  }
}
