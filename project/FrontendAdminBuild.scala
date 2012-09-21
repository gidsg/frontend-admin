import sbt._
import Keys._
import PlayProject._

object FrontendAdminBuild extends Build {

  val appName         = "frontend-admin"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    //compile
    "com.gu" %% "configuration" % "3.6",
    "com.gu" %% "management-play" % "5.15",
    "com.gu" %% "management-logback" % "5.15",
    "com.amazonaws" % "aws-java-sdk" % "1.3.14",

    //test
    "org.scalatest" %% "scalatest" % "1.8" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
    resolvers := Seq(
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases"
    ),
    // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
    testOptions in Test := Nil
  )
}