package com.gu.test;

import java.util.*;

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


	@Given("^I visit a page$")
	public void I_visit_a_page() throws Throwable {
		fendadmin = new FrontendAdminTestPage();
		fendadmin.open("localhost:9000/admin");
	}

	@When("^I am not logged in$")
	public void I_am_not_logged_in() throws Throwable {
		// delete PLAY_SESSION cookie
		fendadmin.getDriver().manage().deleteCookieNamed("PLAY_SESSION");
	}

	@Then("^I should be prompted to log in$")
	public void I_should_be_prompted_to_log_in() throws Throwable {
		// confirm there is a login button
		WebElement loginButton = fendadmin.getDriver().findElement(By.id("login-button"));
	}

	@Given("^I am logged in$")
	public void I_am_logged_in() throws Throwable {
		// checked we're not already logged in - is there a login button
		List<WebElement> loginButtons = fendadmin.getDriver().findElements(By.id("login-button"));
		if (loginButtons.size() > 0) {
			// click login button
			loginButtons.get(0).click();
			// get the login form
			WebElement form = fendadmin.getDriver().findElement(By.id("gaia_loginform"));
			// enter the user's details
			form.findElement(By.name("Email")).sendKeys(System.getProperty("google.username"));
			form.findElement(By.name("Passwd")).sendKeys(System.getProperty("google.password"));
			// submit the form
			form.submit();
			
			// confirm there are no error messages
			List<WebElement> errorMessages = fendadmin.getDriver().findElements(By.className("errormsg"));
			if (errorMessages.size() > 0) {
				Assert.fail("Unable to log in - '" + errorMessages.get(0).getText() + "'");
			}
		}
	}

	@When("^I click the logged out button$")
	public void I_click_the_logged_out_button() throws Throwable {
		fendadmin.getDriver().findElement(By.id("logout-button")).click();
	}

	@Then("^I should be logged out$")
	public void I_should_be_logged_out() throws Throwable {
		fendadmin.getDriver().findElement(By.id("login-button"));
	}

	@Given("^are no configured special events$")
	public void are_no_configured_special_events() throws Throwable {
		new PendingException();
	}

	@When("^I am on the editor page$")
	public void I_am_on_the_editor_page() throws Throwable {
		new PendingException();
	}

	@Then("^I should see an empty form$")
	public void I_should_see_an_empty_form() throws Throwable {
		new PendingException();
	}

	@When("^I enter a tag id 'sport/triathlon'$")
	public void I_enter_a_tag_id_sport_triathlon() throws Throwable {
		new PendingException();
	}

	@When("^click 'save'$")
	public void click_save() throws Throwable {
		new PendingException();
	}

	@Then("^the configuration should be saved$")
	public void the_configuration_should_be_saved() throws Throwable {
		new PendingException();
	}

	@When("^I enter an non-existant tag$")
	public void I_enter_an_non_existant_tag() throws Throwable {
		new PendingException();
	}

	@Then("^then configuraiton should not be saved$")
	public void then_configuraiton_should_not_be_saved() throws Throwable {
		new PendingException();
	}

	@When("^the was an error saving$")
	public void the_was_an_error_saving() throws Throwable {
		new PendingException();
	}

	@Then("^the user should be told the configuration has not been saved$")
	public void the_user_should_be_told_the_configuration_has_not_been_saved() throws Throwable {
		new PendingException();
	}

	@Given("^there is an existing event called 'sport/triathlon'$")
	public void there_is_an_existing_event_called_sport_triathlon() throws Throwable {
		new PendingException();
	}

	@When("^I click 'clear'$")
	public void I_click_clear() throws Throwable {
		new PendingException();
	}

	@Then("^the event should be removed$")
	public void the_event_should_be_removed() throws Throwable {
		new PendingException();
	}

	@After
	public void tearDown(){
		fendadmin.close();
	}

}
