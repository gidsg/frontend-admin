package com.gu.test;

import java.util.*;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import cucumber.annotation.After;
import cucumber.annotation.en.Given;
import cucumber.annotation.en.Then;
import cucumber.annotation.en.When;
import cucumber.runtime.PendingException;
import junit.framework.Assert;

public class FrontendAdminTestSteps {

	private FrontendAdminTestPage fendadmin;

	private String host = System.getProperty("host");


	@Given("^I visit a page$")
	public void I_visit_a_page() throws Throwable {
		fendadmin = new FrontendAdminTestPage();
		fendadmin.open(host + "/admin");
	}

	@When("^I am not logged in$")
	public void I_am_not_logged_in() throws Throwable {
		// delete PLAY_SESSION cookie
		fendadmin.deleteCookieNamed("PLAY_SESSION");
	}

	@Then("^I should be prompted to log in$")
	public void I_should_be_prompted_to_log_in() throws Throwable {
		// confirm there is a login button
		Assert.assertTrue("Login button does not exist", fendadmin.isElementPresent(By.id("login-button")));
	}

	@Given("^I am logged in$")
	public void I_am_logged_in() throws Throwable {
		// checked we're not already logged in - is there a login button
		if (fendadmin.isElementPresent(By.id("login-button"))) {
			// click login button
			fendadmin.clickButton(By.id("login-button"));
			//1st time google asks to approve the url for the email account
			if (fendadmin.isElementPresent(By.id("approve_button"))) {
				fendadmin.clickButton(By.id("approve_button"));	
				fendadmin.getDriver().manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			}

			// enter the user's details
			fendadmin.type(By.name("Email"), System.getProperty("google.username"));
			fendadmin.type(By.name("Passwd"), System.getProperty("google.password"));

			// submit the form
			fendadmin.submit(By.id("gaia_loginform"));

			// confirm there are no error messages
			List<WebElement> errorMessages = fendadmin.getDriver().findElements(By.className("errormsg"));
			if (errorMessages.size() > 0) {
				Assert.fail("Unable to log in - '" + errorMessages.get(0).getText() + "'");
			}
		}
	}

	@When("^I click the logged out button$")
	public void I_click_the_logged_out_button() throws Throwable {
		fendadmin.clickButton(By.id("logout-button"));		
	}

	@Then("^I should be logged out$")
	public void I_should_be_logged_out() throws Throwable {
		fendadmin.clickButton(By.id("login-button"));
	}

	@Given("^are no configured special events$")
	public void are_no_configured_special_events() throws Throwable {
		// TODO - how do we clear the db?

		fendadmin.waitForTextPresent("UK Edition");
		fendadmin.clickButton(By.id("clear-frontend"));
		fendadmin.clickButton(By.id("save-frontend"));

		// wait for save success alert
		fendadmin.getDriver().manage().timeouts().implicitlyWait(4, TimeUnit.SECONDS);
		fendadmin.getDriver().findElement(By.className("alert-success"));
		// reload the page
		fendadmin.getDriver().navigate().refresh();
		// confirm data is empty, look at json in source
		if (fendadmin.getDriver().getPageSource().indexOf("var frontConfig = {\"uk\":{\"blocks\":[]},\"us\":{\"blocks\":[]}};") == -1) {
			Assert.fail("Unable to clear data");
		}
	}

	@When("^I am on the editor page$")
	public void I_am_on_the_editor_page() throws Throwable {
		fendadmin.open(host + "/admin/feature-trailblock");
	}

	@Then("^I should see an empty form$")
	public void I_should_see_an_empty_form() throws Throwable {
		WebElement form = fendadmin.getDriver().findElement(By.id("network-front-tool"));
		// check each input element is empty
		for (WebElement textInput : form.findElements(By.cssSelector("input[type='text']"))) {
			Assert.assertEquals("", textInput.getText());
		}
	}

	@When("^I enter a tag id '(.*)'$")
	public void I_enter_a_tag_id_sport_tagId(String tagId) throws Throwable {
		WebElement tagIdElement = fendadmin.getDriver().findElement(By.name("tag-id"));
		// clear element first
		tagIdElement.clear();
		tagIdElement.sendKeys(tagId);
	}

	@When("^click 'save'$")
	public void click_save() throws Throwable {
		fendadmin.clickButton(By.id("save-frontend"));
	}

	@Then("^the configuration should be saved$")
	public void the_configuration_should_be_saved() throws Throwable {
		// wait for save success alert
		fendadmin.getDriver().manage().timeouts().implicitlyWait(4, TimeUnit.SECONDS);
		fendadmin.getDriver().findElement(By.className("alert-success"));
	}

	@When("^I enter an non-existant tag$")
	public void I_enter_an_non_existant_tag() throws Throwable {
		this.I_enter_a_tag_id_sport_tagId("foo/bar");
		// TODO - need to re-run validation on save - how with events?
		fendadmin.getDriver().manage().timeouts().implicitlyWait(4, TimeUnit.SECONDS);
		fendadmin.getDriver().findElement(By.className("invalid"));
	}

	@Then("^then configuraiton should not be saved$")
	public void then_configuraiton_should_not_be_saved() throws Throwable {
		// wait for save success alert
		fendadmin.getDriver().manage().timeouts().implicitlyWait(4, TimeUnit.SECONDS);
		fendadmin.getDriver().findElement(By.className("alert-error"));
	}

	@When("^the was an error saving$")
	public void the_was_an_error_saving() throws Throwable {
		new PendingException();
	}

	@Then("^the user should be told the configuration has not been saved$")
	public void the_user_should_be_told_the_configuration_has_not_been_saved() throws Throwable {
		new PendingException();
	}

	@Given("^there is an existing event called '(.*)'$")
	public void there_is_an_existing_event_called_tagId(String tagId) throws Throwable {
		this.I_enter_a_tag_id_sport_tagId(tagId);
		this.click_save();
		this.the_configuration_should_be_saved();
	}

	@When("^I click 'clear'$")
	public void I_click_clear() throws Throwable {
		fendadmin.clickButton(By.id("clear-frontend"));
	}

	@Then("^the event should be removed$")
	public void the_event_should_be_removed() throws Throwable {
		this.I_should_see_an_empty_form();
		// reload the page
		fendadmin.refresh();
		// confirm data is empty, look at json in source
		if (fendadmin.getDriver().getPageSource().indexOf("var frontConfig = {\"uk\":{\"blocks\":[]},\"us\":{\"blocks\":[]}};") == -1) {
			Assert.fail("Unable to clear data");
		}
	}

	@After
	public void tearDown(){
		fendadmin.close();
	}

}
