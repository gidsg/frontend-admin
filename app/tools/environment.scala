package tools

import java.util.Properties
import java.io.{File, FileInputStream}

class Environment(path: String) {
  
  private val props = new java.util.Properties()
  
  if(new File(path).exists()) {
    props.load(new FileInputStream(path))
  }

  def getProperty(key: String, default: String) = props.getProperty(key, default).map(_.toLower)

}

