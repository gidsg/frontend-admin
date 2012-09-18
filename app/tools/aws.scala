package tools

import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.s3.model.{ObjectMetadata, PutObjectRequest, GetObjectRequest}
import io.Source
import com.amazonaws.util.StringInputStream
import com.amazonaws.services.s3.model.CannedAccessControlList.PublicRead
import conf.Configuration


trait S3 {

  lazy val bucket = Configuration.aws.bucket

  val configKey = Configuration.configFile

  lazy val accessKey = Configuration.aws.accessKey

  lazy val secretKey = Configuration.aws.secretKey

  private def createClient = new AmazonS3Client(new BasicAWSCredentials(accessKey, secretKey))


  def getConfig = {
    val client = createClient
    val request = new GetObjectRequest(bucket, configKey)
    val config = Source.fromInputStream(client.getObject(request).getObjectContent).mkString
    client.shutdown()
    config
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
