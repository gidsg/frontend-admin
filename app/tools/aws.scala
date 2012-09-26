package tools

import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.s3.model._
import io.Source
import com.amazonaws.util.StringInputStream
import com.amazonaws.services.s3.model.CannedAccessControlList.PublicRead
import conf.Configuration
import controllers.Logging


trait S3 extends Logging {

  lazy val bucket = Configuration.aws.bucket
  lazy val configKey = Configuration.configKey

  lazy val accessKey = Configuration.aws.accessKey

  lazy val secretKey = Configuration.aws.secretKey

  private def createClient = new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey))


  def getConfig = {
    val client = createClient
    val request = new GetObjectRequest(bucket, configKey)
    try{
      val s3object = client.getObject(request)
      Some(Source.fromInputStream(s3object.getObjectContent).mkString)
    } catch { case e: AmazonS3Exception if e.getStatusCode == 404 =>
      log.warn("no config found at %s - %s" format(bucket, configKey))
      None
    } finally {
      client.shutdown()
    }
  }

  def putConfig(config: String) {

    val metadata = new ObjectMetadata()
    metadata.setCacheControl("no-cache,no-store")
    metadata.setContentType("application/json")
    val request = new PutObjectRequest(bucket, configKey, new StringInputStream(config), metadata)
      .withCannedAcl(PublicRead)
    val client = createClient
    client.putObject(request)
    client.shutdown()
  }
}

object S3 extends S3
