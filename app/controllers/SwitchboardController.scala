package controllers

import play.api.mvc._
import play.api.Play.current
import play.api.libs.concurrent.Akka
import tools.S3
import conf._
import io.Source

case class Switch(name: String, isOn: Boolean, description: String)

object SwitchboardController extends Controller with AuthLogging with Logging {

  val SwitchPattern = """([a-z\d-]+)=(on|off)""".r

  //displays in the order they appear in this list
  val switches = Seq(
    //switch names can be letters numbers and hyphens only
    Switch("auto-refresh", true, "Enables auto refresh in pages such as live blogs and live scores. Turn off to help handle exceptional load."),
    Switch("double-cache-times", false, "Doubles the cache time of every endpoint. Turn on to help handle exceptional load."),
    Switch("related-content", true, "Enables related content on content that does not have a story package. Turn off to help handle exceptional load, or to help if there is a Content API problem."),

    Switch("integration-test-switch", true, "Switch that is only used while running tests. You never need to change this switch")
  )

  def render() = AuthAction{ request =>
   log("loaded Switchboard", request)

    val promiseOfSwitches = Akka.future(S3.getSwitches)

    Async{
      promiseOfSwitches.map{ switchesOption =>

        val switchStates = Source.fromString(switchesOption.getOrElse("")).getLines.map{
          case SwitchPattern(key, value) => (key, value == "on")
        }.toMap

        val switchesWithState = switches.map{ switch => switch.copy(isOn = switchStates.get(switch.name).getOrElse(switch.isOn)) }
        Ok(views.html.switchboard(switchesWithState, Configuration.stage))
      }
    }
  }

  def save() = AuthAction{ request =>
    log("saved switchboard", request)

    val switchValues = request.body.asFormUrlEncoded.map{ params =>
      switches.map{ switch => switch.name + "=" + params.get(switch.name).map(v => "on").getOrElse("off") }
    }.get

    val promiseOfSavedSwitches = Akka.future(saveSwitchesOrError(switchValues.mkString("\n")))

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
