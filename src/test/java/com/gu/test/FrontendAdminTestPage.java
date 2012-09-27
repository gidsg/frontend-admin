package com.gu.test;

import java.util.NoSuchElementException;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
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

	public void deleteCookieNamed(String cookieName) {
		getDriver().manage().deleteCookieNamed(cookieName);
	}

	public boolean isElementPresent(By elementName){
		boolean exists=false;
		try{
			exists = getDriver().findElements(elementName).size() != 0;
		}catch(NoSuchElementException e){
		}
		return exists;
	}

	public void clickButton(By buttonName) {
		getDriver().findElement(buttonName).click();
		getDriver().manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public WebDriver getDriver() {
		return driver;
	}

}
