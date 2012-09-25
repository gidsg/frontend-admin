package controllers

import play.api.mvc.{Action, Controller}
import tools.Props

object IndexController extends Controller {

  def render() = AuthAction{
    val env = new Props("/etc/gu/install_vars").getProperty("STAGE", "PROD")
    Ok(views.html.index(env))
  }

}
