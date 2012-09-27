package controllers

import play.api.mvc.{Action, Controller}
import conf.Configuration

object IndexController extends Controller {

  def render() = AuthAction{
    Ok(views.html.index(Configuration.stage))
  }

}
