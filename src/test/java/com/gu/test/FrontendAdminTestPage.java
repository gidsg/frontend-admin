package com.gu.test;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;


public class FrontendAdminTestPage {
	private WebDriver driver;

	public FrontendAdminTestPage() {        
		if (driver == null) {
			driver = new FirefoxDriver();
		}
	}

	public void open(String string) {
		driver.get("http://www.google.co.uk");
	}

	public void close() {
		driver.close();
	}
	
}
