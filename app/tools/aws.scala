package tools

import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.s3.model._
import io.Source
import com.amazonaws.util.StringInputStream
import com.amazonaws.services.s3.model.CannedAccessControlList.PublicRead
import conf.{ Configuration, Logging }
import com.amazonaws.services.dynamodb.AmazonDynamoDBClient
import com.amazonaws.services.dynamodb.model._
import collection.JavaConversions._
import scala.Some
import model.{Content, Event}
import java.util.UUID

trait Credentials {
  private lazy val accessKey = Configuration.aws.accessKey
  private lazy val secretKey = Configuration.aws.secretKey

  lazy val credentials = new BasicAWSCredentials(accessKey, secretKey)
}

object EqualTo {
  def apply(s: String) = new Condition()
    .withComparisonOperator(ComparisonOperator.EQ)
    .withAttributeValueList(new AttributeValue(s))
}

object NotNull {
  def apply() = new Condition()
    .withComparisonOperator(ComparisonOperator.NOT_NULL)
}


trait DynamoDB extends Credentials with Logging {

  private def createClient = {
  val client = new AmazonDynamoDBClient(credentials)
    //todo put in config
    client.setEndpoint("https://dynamodb.eu-west-1.amazonaws.com")
    client
  }

  def put(tableName: String, attributes: Map[String, AttributeValue]) = {
    val client = createClient
    try {
      val request = new PutItemRequest(tableName, attributes)
      client.putItem(request)
    } finally {
      client.shutdown()
    }
  }

  def get(tableName: String, id: String): Map[String, AttributeValue] = {
    val client = createClient
    try {
      // we want admin reads to be consistent
      val request = new GetItemRequest(tableName, new Key(new AttributeValue(id))).withConsistentRead(true)
      val item = client.getItem(request)
      Option(item.getItem).map(_.toMap).getOrElse(Map.empty)
    } finally {
      client.shutdown()
    }
  }

  def get(tableName: String, id1: String, id2: String): Map[String, AttributeValue] = {
    val client = createClient
    try {
      // we want admin reads to be consistent
      val request = new GetItemRequest(tableName, new Key(new AttributeValue(id1), new AttributeValue(id2))).withConsistentRead(true)
      val item = client.getItem(request)
      Option(item.getItem).map(_.toMap).getOrElse(Map.empty)
    } finally {
      client.shutdown()
    }
  }

  def findByField(tableName: String, fieldName: String, fieldValue: String): Seq[Map[String, AttributeValue]] = {

    val client = createClient

    try {
      val request = new ScanRequest(tableName).withScanFilter(Map(fieldName -> EqualTo(fieldValue)))
      client.scan(request).getItems.map(_.toMap)
    } finally {
      client.shutdown()
    }
  }

  def listTable(tableName: String) = {

    val client = createClient

    try {
      val request = new ScanRequest(tableName).withScanFilter(Map("id" -> NotNull()))
      client.scan(request).getItems.map(_.toMap)
    } finally {
      client.shutdown()
    }
  }
}

trait EventPersistence extends DynamoDB {

  //TODO per stage event tables
  private lazy val eventTable = "dev_event"
  private lazy val contentTable = "dev_content"

  def listEvents: Seq[Event] = listTable(eventTable).flatMap{a => loadEvent(a("id").getS)}

  def saveEvent(event: Event) = {

    val parentEvent = event.parent.map{p =>
      loadEvent(p.id).getOrElse(throw new IllegalStateException("Trying to set a parent that does not exist " + p.id))
    }

    val newChainId: Option[String] = parentEvent.flatMap(_.chainId).orElse(event.chainId).orElse(Some(UUID.randomUUID.toString))

    val updatedEvent = event.copy(
      chainId = newChainId,
      parent = parentEvent
    )
    put(eventTable, updatedEvent.asAttributes)

    updatedEvent.content.map{ content =>
      content.copy(eventId = Some(event.id))
    }.foreach{ content =>
      put(contentTable, content.asAttributes)
    }
    updatedEvent
  }

  def loadEvent(id: String): Option[Event] = {
    val attributes = get(eventTable, id)
    if (attributes.isEmpty) None
    else {
      val event = Event(attributes)

      val eventContent = findByField(contentTable, "eventId", event.id).map(Content(_))

      Some(event.copy(
        parent = event.parent.flatMap(p => loadEvent(p.id)),
        content = eventContent
      ))
    }
  }

  def findEventsInChain(chainId: String): Seq[Event] = findByField(eventTable, "chainId", chainId).map(Event(_))
}

trait S3 extends Credentials with Logging {

  lazy val bucket = Configuration.aws.bucket
  lazy val configKey = Configuration.configKey
  lazy val switchesKey = Configuration.switchesKey


  private def createClient = new AmazonS3Client(credentials)


  def getConfig = get(configKey)
  def putConfig(config: String) { put(configKey, config, "application/json") }

  def getSwitches = get(switchesKey)
  def putSwitches(config: String) { put(switchesKey, config, "text/plain") }

  private def get(key: String): Option[String] = {
    val client = createClient
    val request = new GetObjectRequest(bucket, key)
    try{
      val s3object = client.getObject(request)
      Some(Source.fromInputStream(s3object.getObjectContent).mkString)
    } catch { case e: AmazonS3Exception if e.getStatusCode == 404 =>
      log.warn("not found at %s - %s" format(bucket, key))
      None
    } finally {
      client.shutdown()
    }
  }

  private def put(key: String, value: String, contentType: String) {
    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType(contentType)
    val request = new PutObjectRequest(bucket, key, new StringInputStream(value), metadata)
      .withCannedAcl(PublicRead)
    val client = createClient
    client.putObject(request)
    client.shutdown()
  }
}

object S3 extends S3
