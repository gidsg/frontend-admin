package com.gu.test;

import static org.junit.Assert.*;

import java.util.NoSuchElementException;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

public class JasmineTest {

	private WebDriver driver;
	private String host;
	private StringBuffer verificationErrors = new StringBuffer();

	@Before
	public void setUp() throws Exception {
		driver = new FirefoxDriver();
		host = "http://localhost:9000";
		driver.get(host + "/assets/javascripts/spec/SpecRunner.html");	
	}

	@Test
	public void jasmineTest() throws Exception {
		if (driver.findElements(By.cssSelector("span.failingAlert.bar")).size() != 0) {
			System.out.println("==========================================================================================");
			System.out.println(driver.findElement(By.cssSelector("span.failingAlert.bar")).getText());
			System.out.println("==========================================================================================");
			System.out.println(driver.findElement(By.xpath("id('details')")).getText());
			System.out.println("==========================================================================================");
		}
	}

	@After
	public void tearDown() throws Exception {
		driver.quit();
		String verificationErrorString = verificationErrors.toString();
		if (!"".equals(verificationErrorString)) {
			fail(verificationErrorString);
		}
	}

}
