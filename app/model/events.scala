package model

import com.novus.salat._
import json.{StringDateStrategy, JSONConfig}
import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._


case class Parent(id: String)
case class Content(id: String, importance: Int)

case class Event(
  id: String,
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[Content] = Nil,
  parent: Option[Parent] = None
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

}