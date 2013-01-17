import sbt._
import Keys._
import PlayProject._
import com.gu.deploy.PlayArtifact.playArtifactDistSettings
import sbtassembly.Plugin.AssemblyKeys._
import sbtassembly.Plugin.MergeStrategy

object FrontendAdminBuild extends Build {

  val appName         = "frontend-admin"
  val appVersion      = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    //compile
    "com.gu" %% "configuration" % "3.6",
    "com.gu" %% "management-play" % "5.15",
    "com.gu" %% "management-logback" % "5.15",
    "com.amazonaws" % "aws-java-sdk" % "1.3.27",

    //test
    "org.scalatest" %% "scalatest" % "1.8" % "test"
  )

  val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA)
    .settings(playArtifactDistSettings: _*)
    .settings(
    resolvers ++= Seq(
      "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases",
      "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
      Classpaths.typesafeResolver
    ),
    // Use ScalaTest https://groups.google.com/d/topic/play-framework/rZBfNoGtC0M/discussion
    testOptions in Test := Nil,
    jarName in assembly := "frontend-admin.jar",
    mergeStrategy in assembly <<= (mergeStrategy in assembly) { (old) => {
        case s: String if s.contains("org/apache/commons/logging/") => MergeStrategy.first
        case x => old(x)
      }
    }
  )
}