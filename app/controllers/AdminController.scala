package controllers

import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.S3

object AdminController extends Controller {
  
  def edit(edition: String) = AuthAction{
    edition match {
      case "uk" => render("UK")
      case "us" => render("US")
      case _ => NotFound("Unknown edition " + edition)
    }
  }

  def render(edition: String) = {
    Ok(views.html.edit(edition))
  }

  def save() = Action{
    val promiseOfUpload = Akka.future(S3.putConfig("""{"config":"dummy"}"""))
    Async{
      promiseOfUpload.map(u => Ok("uploaded"))
    }
  }

  def get() = Action{
    val promiseOfConfig = Akka.future(S3.getConfig)
    Async{
      promiseOfConfig.map(Ok(_))
    }
  }
}