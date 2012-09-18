import sbt._
import Keys._
import PlayProject._

object FrontendAdminBuild extends Build {

  val appName         = "frontend-admin"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    "com.gu" %% "configuration" % "3.6",
    "com.gu" %% "management-play" % "5.15",
    "com.gu" %% "management-logback" % "5.15",
    "com.amazonaws" % "aws-java-sdk" % "1.3.14"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
    resolvers := Seq(
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases"
    )
  )
}