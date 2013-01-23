package model

import org.joda.time.DateTime
import play.api.libs.json.{JsArray, JsString, JsObject}
import org.joda.time.format.DateTimeFormat
import com.amazonaws.services.dynamodb.model.AttributeValue

trait Persistable {
  def asAttributes: Map[String, AttributeValue]
  def asMap: Map[String, Any]

  private[model] def stringAttr(s: String): AttributeValue = new AttributeValue().withS(s)
  private[model] def dateAttr(d: DateTime): AttributeValue = new AttributeValue().withN(d.getMillis.toString)
  private[model] def intAttr(i: Int): AttributeValue = new AttributeValue().withN(i.toString)
}

case class Content(
  id: String,
  eventId: Option[String],
  importance: Option[Int]
) extends Persistable {

  lazy val asAttributes: Map[String, AttributeValue] = Seq[Option[(String, AttributeValue)]](
    Some("id" ->  stringAttr(id)),
    eventId.map("eventId" ->  stringAttr(_)),
    importance.map("importance" ->  intAttr(_))
  ).flatten.toMap

  lazy val asMap: Map[String, Any] = Seq[Option[(String, Any)]](
    Some("id" ->  id),
    importance.map("importance" ->  _),
    eventId.map("eventId" ->  _)
  ).flatten.toMap
}

object Content {

  def apply(js: JsObject): Content = Content(
    id = (js \ "id").as[String],
    importance = (js \ "importance").asOpt[Int],
    eventId = (js \ "eventId").asOpt[String]
  )

  def apply(attributes: Map[String, AttributeValue]): Content = Content(
    id = attributes("id").getS,
    eventId = attributes.get("eventId").map(_.getS),
    importance = attributes.get("importance").map(_.getN.toInt)
  )
}

case class Event(
  id: String,
  startDate: Option[DateTime] = None,
  title: Option[String] = None,
  parent: Option[Event] = None,
  content: Seq[Content] = Nil,
  chainId: Option[String] = None
) extends Persistable {

  lazy val asAttributes: Map[String, AttributeValue] = Seq[Option[(String, AttributeValue)]](
    Some("id" ->  stringAttr(id)),
    startDate.map("startDate" ->  dateAttr(_)),
    title.map("title" -> stringAttr(_)),
    parent.map(p => "parentId" -> stringAttr(p.id)),
    chainId.map("chainId" -> stringAttr(_))
  ).flatten.toMap

  lazy val asMap: Map[String, Any] = Seq[Option[(String, Any)]](
    Some("id" ->  id),
    startDate.map("startDate" ->  _.toString(Event.internetDateFormat)),
    title.map("title" -> _),
    parent.map(p => "parent" -> p.asMap),
    chainId.map("chainId" -> _),
    if (content.nonEmpty) Some("content" -> content.map(_.asMap)) else None
  ).flatten.toMap
}

object Event {

  val internetDateFormat = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")

  def apply(js: JsObject): Event = {
    Event(
      id = (js \ "id").as[String],
      startDate = Some(internetDateFormat.parseDateTime((js \ "startDate").as[String])),
      title = Some((js \ "title").as[String]),
      parent = (js \ "parent" \ "id").asOpt[String].map(id => Event(id)),
      chainId = (js \ "chainId").asOpt[String],
      content = (js \ "content").asOpt[Seq[JsObject]].getOrElse(Nil).map(Content(_))
    )
  }

  def apply(attributes: Map[String, AttributeValue]): Event = Event(
    id = attributes("id").getS,
    startDate = attributes.get("startDate").map(_.getN.toLong).map(new DateTime(_)),
    title = attributes.get("title").map(_.getS),
    parent = attributes.get("parentId").map(_.getS).map(Event(_)),
    chainId = attributes.get("chainId").map(_.getS)
  )
}
