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

	public boolean isTextPresent(String textToSearch) {
		return getDriver().findElement(By.tagName("body")).getText().contains(textToSearch);
		}


	public WebDriver getDriver() {
		return driver;
	}

	public void waitForTextPresent(String textToSearch) {
		for (int second = 0;; second++) {
			if (second >= 30) System.out.println("could not find " + textToSearch);
			try { if (isTextPresent(textToSearch)) break; } catch (Exception e) {}
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		
	}

}