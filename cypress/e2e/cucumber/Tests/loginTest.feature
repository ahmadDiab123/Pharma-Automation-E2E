Feature: Login functionality

  Scenario: Login page is available
    Given I navigate to the login page
    Then I should see the login form

  Scenario Outline: Successful login with different valid account roles
    Given I navigate to the login page
    When I sign in with the "<account>" account
    Then I should be redirected to the drug grouping page

    Examples:
      | account           |
      | sysadmin          |
      | super_super_admin |
     # | super_admin       |
     # | api_consumer      |

  Scenario: Login with invalid password
    Given I navigate to the login page
    When I sign in with an invalid password
    Then I should see invalid credentials error

  Scenario: Login with invalid email
    Given I navigate to the login page
    When I sign in with an invalid email
    Then I should see invalid email error

  Scenario: Login with empty email and password
    Given I navigate to the login page
    When I click the Sign in button with empty credentials
    Then I should see required validation errors for email and password
