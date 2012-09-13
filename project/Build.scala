import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

    val appName         = "frontend-admin"
    val appVersion      = "1.0-SNAPSHOT"

    val appDependencies = Seq(
      // Add your project dependencies here,
    )

    val main = PlayProject(appName, appVersion, appDependencies, mainLang = SCALA).settings(
      resolvers := Seq(
        "Guardian Github Releases" at "http://guardian.github.com/maven/repo-releases"
      ),
      libraryDependencies ++= Seq(
        "com.gu" %% "configuration" % "3.6"
      )
    )

}
