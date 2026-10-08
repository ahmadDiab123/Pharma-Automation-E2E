Feature: Drug Grouping

  Background:
    Given I am logged in as the system administrator
    And I navigate to Drug Grouping

  Scenario: DG-01 Verify Drug Grouping page loads on Custom Groups tab
    Then the Drug Grouping page should be visible on Custom Groups

  Scenario: DG-02 Search for an existing Custom Group
    When I search for an existing Custom Group
    Then the existing Custom Group should be shown

  Scenario: DG-03 Search for a non-existing Custom Group
    When I search for a non-existing Custom Group
    Then the Custom Group empty state should be shown

  Scenario: DG-04 View an existing Custom Group
    When I open the existing Custom Group details
    Then the existing Custom Group details and members should be visible

  @DG-05
  Scenario: DG-05 Verify Custom Group table status code count and pagination
    Then the Custom Group table status code count and pagination should be valid

  Scenario: DG-06 Switch between Custom and Medical Groups tabs
    When I switch to the Medical Groups tab
    Then the Medical Groups tab should be active
    When I switch to the Custom Groups tab
    Then the Drug Grouping page should be visible on Custom Groups

  Scenario: DG-08 Open and cancel New Custom Group form
    When I open a new Custom Group form
    Then the Custom Group form should be visible
    When I cancel the Custom Group form
    Then the Custom Group form should be closed

  Scenario: DG-09 Validate Group Name minimum length
    When I open a new Custom Group form
    And I save a group with a one-character name
    Then the Group Name minimum length validation should be shown

  Scenario: DG-10 Validate required Group Members
    When I open a new Custom Group form
    And I save a group without members
    Then the group members required validation should be shown

  @DG-11
  Scenario: DG-11 Search select and remove a drug code
    When I open a new Custom Group form
    And I search select and remove an initial drug code
    Then the initial drug code should be selected
    When I remove the selected initial drug code
    Then the initial drug code should be removed

  Scenario: DG-12 Verify no matching drug results
    When I open a new Custom Group form
    And I search for a non-existing drug reference
    Then no drug reference results should be shown

  @DG-13
  Scenario: DG-13 Create a valid Custom Group
    Given I am logged in as the super super administrator
    Given I prepare a unique Custom Group name
    When I create the current automation Custom Group
    Then the current automation Custom Group should be created

  @DG-14
  Scenario: DG-14 Edit the Custom Group created in this scenario
    Given I am logged in as the super super administrator
    Given I prepare a unique Custom Group name
    And I create the current automation Custom Group
    When I edit the current automation group description
    Then the current automation Custom Group description should be updated

  @DG-15
  Scenario: DG-15 Add and remove drug codes during edit
    Given I am logged in as the super super administrator
    Given I prepare a unique Custom Group name
    And I create the current automation Custom Group
    When I add and remove drug codes during the current automation group edit
    Then the current automation Custom Group members should be updated

  @DG-17
  Scenario: DG-17 Toggle visible automation Custom Group statuses
    Given I am logged in as the super super administrator
    When I search for automation Custom Groups
    Then the automation Custom Groups should be displayed
    When I toggle the visible automation Custom Group statuses
    Then the visible automation Custom Group statuses should be toggled

  @DG-23
  Scenario: DG-23 Prevent an exact duplicate Custom Group name
    Given I am logged in as the super super administrator
    When I search for automation Custom Groups
    Then the automation Custom Groups should be displayed
    When I select an existing automation Custom Group name for duplicate validation
    And I open a new Custom Group form
    And I attempt to create a Custom Group with the selected duplicate name
    Then the duplicate Custom Group name should be rejected
    When I return to the selected duplicate Custom Group search
    Then only the original Custom Group with the selected duplicate name should exist

  @DG-22
  Scenario: DG-22 Verify user can delete an automation-created Custom Group
    Given I am logged in as the super super administrator
    And I prepare a disposable automation Custom Group
    And I create the disposable automation Custom Group
    Then the disposable automation Custom Group should exist
    When I open Delete for the disposable automation Custom Group
    Then the Custom Group delete confirmation should be visible
    When I confirm Custom Group deletion
    And I search for the disposable automation Custom Group
    Then the disposable automation Custom Group should be deleted

  @DG-25
  Scenario Outline: DG-25 Verify filtering Custom Drug Groups by status
    When I filter Custom Groups by "<status>" status
    Then only Custom Groups with "<status>" status should be displayed

    Examples:
      | status   |
      | Active   |
      | Inactive |

  @DG-26
  Scenario: DG-26 Verify user can cancel Custom Group deletion
    Given I am logged in as the super super administrator
    And I prepare a disposable automation Custom Group
    And I create the disposable automation Custom Group
    Then the disposable automation Custom Group should exist
    When I open Delete for the disposable automation Custom Group
    Then the Custom Group delete confirmation should be visible
    When I cancel Custom Group deletion
    Then the Custom Group delete confirmation should be closed
    When I search for the disposable automation Custom Group
    Then the disposable automation Custom Group should exist
    When I open Delete for the disposable automation Custom Group
    And I confirm Custom Group deletion
    And I search for the disposable automation Custom Group
    Then the disposable automation Custom Group should be deleted
