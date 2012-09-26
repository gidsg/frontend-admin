package controllers

import play.api.mvc.{Action, Controller}

object IndexController extends Controller {

  def render() = AuthAction{
    Ok(views.html.index())
  }

}
