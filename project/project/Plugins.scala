import sbt._

object Plugins extends Build {


  // We automatically include some plugins (including the Play plugin) from sbt-play-assethash.

  lazy val plugins = Project("build", file("."))
    .dependsOn(uri("git://github.com/guardian/sbt-play-artifact.git#2.0"))
    .dependsOn(uri("git://github.com/guardian/sbt-teamcity-test-reporting-plugin.git#1.2"))
}