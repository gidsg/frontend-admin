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


trait Credentials {
  private lazy val accessKey = Configuration.aws.accessKey
  private lazy val secretKey = Configuration.aws.secretKey

  lazy val credentials = new BasicAWSCredentials(accessKey, secretKey)

}


object DbValue {
  def apply(value: Any): AttributeValue = value match {
    case s: String => new AttributeValue().withS(s)
    case l: Long => new AttributeValue().withN(l.toString)
    case _ => throw new IllegalArgumentException("unknown value type: " + value)
  }
}

trait DynamoDB extends Credentials with Logging {

  private def createClient = {
    val client = new AmazonDynamoDBClient(credentials)
    client.setEndpoint("https://dynamodb.eu-west-1.amazonaws.com")
    client
  }

  def put(tableName: String, properties: Map[String, Any]) = {
    val client = createClient
    try {
      val attributes = properties.map { case (key, value) => key -> DbValue(value) }
      val request = new PutItemRequest(tableName, attributes)
      client.putItem(request)
    } finally {
      client.shutdown()
    }
  }

  def get(tableName: String, id: Any): Map[String, Any] = {
    val client = createClient
    try {
      // eventually consistent reads give twice the throughput http://aws.amazon.com/dynamodb/
      // it is the default, just being verbose here
      val request = new GetItemRequest(tableName, new Key(DbValue(id))).withConsistentRead(false)
      val item = client.getItem(request)
      item.getItem.toMap.map{ case (key, attr) => key -> Option(attr.getN).map(_.toLong).getOrElse(attr.getS) }
    } finally {
      client.shutdown()
    }
  }
}

object DynamoDB extends DynamoDB

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
