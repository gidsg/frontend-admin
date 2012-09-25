package controllers

import play.api.mvc._
import play.api.mvc.Results._
import play.api.mvc.BodyParsers._
import net.liftweb.json.{ Serialization, NoTypeHints }
import net.liftweb.json.Serialization.{ read, write }
import play.api.libs.openid.OpenID
import play.api.libs.concurrent.{ Thrown, Redeemed }
import tools.Props

case class Identity(openid: String, email: String, firstName: String, lastName: String) {
  implicit val formats = Serialization.formats(NoTypeHints)
  def writeJson = write(this)

  lazy val fullName = firstName + " " + lastName
  lazy val emailDomain = email.split("@").last
}

object Identity {
  val KEY = "identity"
  implicit val formats = Serialization.formats(NoTypeHints)
  def readJson(json: String) = read[Identity](json)
  def apply(request: Request[Any]): Option[Identity] = {
    request.session.get(KEY).map(credentials => Identity.readJson(credentials))
  }
}

object AuthenticatedRequest {
  def apply[A](request: Request[A]) = {
    new AuthenticatedRequest(Identity(request), request)
  }
}

class AuthenticatedRequest[A](val identity: Option[Identity], request: Request[A]) extends WrappedRequest(request) {
  lazy val isAuthenticated = identity.isDefined
}

object NonAuthAction {

  def apply[A](p: BodyParser[A])(f: AuthenticatedRequest[A] => Result) = {
    Action(p) { implicit request => f(AuthenticatedRequest(request)) }
  }

  def apply(f: AuthenticatedRequest[AnyContent] => Result): Action[AnyContent] = {
    this.apply(parse.anyContent)(f)
  }

  def apply(block: => Result): Action[AnyContent] = {
    this.apply(_ => block)
  }

}

object AuthAction {

  def apply[A](p: BodyParser[A])(f: AuthenticatedRequest[A] => Result) = {
    Action(p) { implicit request =>
      Identity(request).map { identity =>
        f(new AuthenticatedRequest(Some(identity), request))
      }.getOrElse(Redirect(routes.Login.login).withSession {
        request.session + ("loginFromUrl", request.uri)
      })
    }
  }

  def apply(f: AuthenticatedRequest[AnyContent] => Result): Action[AnyContent] = {
    this.apply(parse.anyContent)(f)
  }

  def apply(block: => Result): Action[AnyContent] = {
    this.apply(_ => block)
  }

}

object Login extends Controller {
  val openIdAttributes = Seq(
    ("email", "http://axschema.org/contact/email"),
    ("firstname", "http://axschema.org/namePerson/first"),
    ("lastname", "http://axschema.org/namePerson/last")
  )
  val googleOpenIdUrl = "https://www.google.com/accounts/o8/id"

  def login = NonAuthAction { request =>
    val error = request.flash.get("error")
    val env = new Props("/etc/gu/install_vars").getProperty("STAGE", "PROD")
    Ok(views.html.auth.login(request, error, env))
  }

  def loginPost = Action { implicit request =>
    AsyncResult(
      OpenID
        .redirectURL(googleOpenIdUrl, routes.Login.openIDCallback.absoluteURL(), openIdAttributes)
        .extend(_.value match {
        case Redeemed(url) => Redirect(url)
        case Thrown(t) => Redirect(routes.Login.login).flashing(("error" -> "Unknown error: %s ".format(t.getMessage)))
      })
    )
  }

  def openIDCallback = Action { implicit request =>
    AsyncResult(
      OpenID.verifiedId.extend(_.value match {
        case Redeemed(info) => {
          val credentials = Identity(
            info.id,
            info.attributes.get("email").get,
            info.attributes.get("firstname").get,
            info.attributes.get("lastname").get
          )
          if (credentials.emailDomain == "guardian.co.uk") {
            Redirect(session.get("loginFromUrl").getOrElse("/admin")).withSession {
              session + (Identity.KEY -> credentials.writeJson) - "loginFromUrl"
            }
          } else {
            Redirect(routes.Login.login).flashing(
              ("error" -> "You can only log in using a Guardian Google Account")
            ).withSession(session - Identity.KEY)
          }
        }
        case Thrown(t) => {
          Redirect(routes.Login.login).flashing(("error" -> ("An error as occurred: " + t.getMessage)))
        }
      })
    )
  }

  def logout = Action { implicit request =>
    Redirect("/login").withSession {
      session - Identity.KEY
    }
  }
}
