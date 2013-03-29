package controllers

import conf._
import play.api.mvc.{ Content => _, _ }
import play.api.libs.ws.WS

object TeamCityProxyController extends Controller with Logging {
 
  def get(path: String) = Action { implicit request =>

   val url: String = "http://teamcity.gudev.gnl:8111/guestAuth/" + path

    Async {
     WS
       .url(url)
       .withHeaders("Accept" -> "application/json")
       .get()
       .map { response =>
         response.status match {
           case 200 =>
              Ok(response.body) as "application/json"
            case 404 => NotFound
        }
      }
    }
  }
}
