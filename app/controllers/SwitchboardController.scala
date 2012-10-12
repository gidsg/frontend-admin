package controllers

import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.S3
import conf._
import io.Source

case class Switch(name: String, value: String)

object SwitchboardController extends Controller with Logging {

  val SwitchPattern = """([\w\d-]+)=(on|off)""".r


  def render() = AuthAction{ request: AuthenticatedRequest[AnyContent] =>
    request.identity.foreach( id => log.info(id.email +  " loaded Switchboard"))
    val promiseOfSwitches = Akka.future(S3.getSwitches)

    Async{
      promiseOfSwitches.map{ switchesOption =>
        val switches = Source.fromString(switchesOption.getOrElse("")).getLines.map{
          case SwitchPattern(key, value) => Switch(key, value)
        }
        Ok(views.html.switchboard(switches.toSeq, Configuration.stage))
      }
    }
  }




  def save() = AuthAction{ request: AuthenticatedRequest[AnyContent] =>
    request.identity.foreach( id => log.info(id.email +  " saved config"))

    //TODO really - this many hoops to jump through
    val switches = request.body.asFormUrlEncoded.get.get("switches").get.head

    val promiseOfSavedSwitches = Akka.future(saveSwitchesOrError(switches))

    Async{
      promiseOfSavedSwitches.map{ result =>
        result
      }
    }
  }

  private def saveSwitchesOrError(switches: String) = try {
    S3.putSwitches(switches)
    log.info("switches successfully updated")
    SwitchesUpdateCounter.recordCount(1)
    Redirect(routes.SwitchboardController.render())
  } catch { case e =>
      log.error("exception saving switches", e)
      SwitchesUpdateErrorCounter.recordCount(1)
      Redirect(routes.SwitchboardController.render()).flashing("error" -> "Error saving switches '%s'".format(e.getMessage))
  }
}
