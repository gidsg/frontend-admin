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

	public void open(String url) {
		driver.get(url);
	}

	public void close() {
		driver.close();
	}

	public WebDriver getDriver() {
		return driver;
	}

}
