package controllers

import play.api.mvc._
import play.api.templates.Html

object AdminController extends Controller {
  
  def edit(edition: String) = Action {

    edition match {
      case "uk" => render("UK")
      case "us" => render("US")
      case _ => NotFound("Unknown edition " + edition)
    }


  }

  def render(edition: String) = {
    Ok(views.html.edit(edition))
  }
}