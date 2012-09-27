// Additional information on initialization
logLevel := Level.Warn

resolvers ++= Seq(
  "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
  Classpaths.typesafeResolver
)

addSbtPlugin("play" % "sbt-plugin" % "2.0.3")

addSbtPlugin("com.typesafe.sbtscalariform" % "sbtscalariform" % "0.4.0")