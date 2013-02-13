package model

import com.novus.salat._
import json.{StringDateStrategy, JSONConfig}
import org.joda.time.DateTime
import com.mongodb.casbah.commons.conversions.scala.{RegisterJodaTimeConversionHelpers, RegisterConversionHelpers}
import org.joda.time.format.ISODateTimeFormat
import com.mongodb.casbah.Imports._
import tools.Mongo.Stories
import com.mongodb

case class Modified(email: String, date: DateTime)

//TODO rename the SContent (and other classes) after we have deleted copies in Event
case class SContent(id: String, importance: Int)
case class SPerson(
  id: String,
  name: Option[String],
  imageUrl: Option[String] = None,
  explainer: Option[String] = None
)

case class SEvent(
  startDate: DateTime,
  title: String,
  importance: Option[Int] = None,
  content: Seq[SContent] = Nil,
  people: Seq[SPerson] = Nil
)

case class Story(
  id: String,
  title: String,
  events: Seq[SEvent] = Nil,
  createdBy: Option[Modified] = None,
  modifiedBy: Seq[Modified] = Nil
)

object Story {

  implicit val ctx = new Context {
    val name = "ISODateTimeFormat context"

    override val jsonConfig = JSONConfig(dateStrategy =
      StringDateStrategy(dateFormatter = ISODateTimeFormat.dateTime))
  }

  RegisterConversionHelpers()
  RegisterJodaTimeConversionHelpers()

  def fromJson(json: String) = grater[Story].fromJSON(json)
  def toJsonString(s: Story) = grater[Story].toPrettyJSON(s)

  def toDbObject(s: Story) = grater[Story].asDBObject(s)
  def fromDbObject(s: DBObject) = grater[Story].asObject(s)

  def toJsonList(s: Seq[Story]) = grater[Story].toPrettyJSONArray(s)


  object mongo {
    def createNew(story: Story) = {
      Stories.insert(toDbObject(story)).getLastError.ok()
      story
    }

    //stuff.find( { foo: /^bar$/i } );
    // this is gonna be a slow query
    def find(title:String) = Stories.find(Map("title" -> "(?i)%s".format(title).r.pattern)).toSeq.map(fromDbObject)

    def update(storyId: String, story: Story) = {
      Stories.update(Map("id" -> storyId), toDbObject(story), upsert = false)
      story
    }

    def delete(storyId: String) = Stories.remove(Map("id" -> storyId)).getLastError().ok()

    def get(id: String) = Stories.findOne(Map("id" -> id)).map(fromDbObject)

    def latest = Stories.find().sort(Map("createdBy.date" -> 1)).toSeq.map(fromDbObject)
  }
}