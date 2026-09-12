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

  Scenario: Access protected route without login
    Given I open a protected route without logging in
    Then I should be prevented from accessing the protected page

  Scenario: Logout successfully
    Given I navigate to the login page
    When I sign in with the "sysadmin" account
    Then I should see the authenticated drug grouping page
    When I log out
    Then I should be logged out

  Scenario: Protected page cannot be accessed after logout
    Given I navigate to the login page
    When I sign in with the "sysadmin" account
    Then I should see the authenticated drug grouping page
    When I log out
    Then I should be logged out
    When I navigate back in the browser
    Then I should be prevented from accessing the protected page

  Scenario: Session persists after page refresh
    Given I navigate to the login page
    When I sign in with the "sysadmin" account
    Then I should see the authenticated drug grouping page
    When I refresh the authenticated page
    Then I should remain authenticated after refresh
