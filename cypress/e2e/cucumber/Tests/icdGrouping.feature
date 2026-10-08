Feature: ICD Grouping

  Background:
    Given I am logged in as the system administrator for ICD Grouping
    And I navigate to ICD Grouping
    Then the ICD Grouping page should be ready on Custom Groups

  @ICD-01
  Scenario: ICD-01 ICD Grouping loads on the Custom Groups tab
    Then the ICD Grouping page should be ready on Custom Groups

  @ICD-02
  Scenario: ICD-02 Search an existing Custom Group by name
    Given the existing ICD Custom Group and its known member are verified
    When I search ICD Custom Groups by the existing group name
    Then the ICD name search should show the intended group and matching results

  @ICD-03
  Scenario: ICD-03 Search Custom Groups by an ICD member code
    Given the existing ICD Custom Group and its known member are verified
    When I search ICD Custom Groups by the known ICD member code
    Then the ICD code search should show groups containing matching codes
    When I open the existing ICD Custom Group from the current results
    Then the known ICD member should be visible in the group
    When I close the ICD group View drawer
    Then the ICD group View drawer should be closed

  @ICD-04
  Scenario: ICD-04 Search Custom Groups by status text
    When I search ICD Custom Groups for status text "active"
    Then the ICD status text search should show matching statuses with the status filter unchanged

  @ICD-05
  Scenario: ICD-05 Search a non-existing Custom Group and clear the search
    When I search ICD Custom Groups with a unique nonmatching query
    Then the ICD Custom Group search should be empty
    When I clear the ICD Grouping search
    Then the normal ICD Custom Group list should return

  @ICD-06
  Scenario: ICD-06 View an existing Custom Group and its members
    Given the existing ICD Custom Group and its known member are verified
    When I search ICD Custom Groups by the existing group name
    Then the ICD name search should show the intended group and matching results
    When I open the existing ICD Custom Group from the current results
    Then the ICD group details and members should match the verified existing group
    When I close the ICD group View drawer
    Then the ICD group View drawer should be closed

  @ICD-07
  Scenario: ICD-07 Switch between Custom and Medical tabs
    When I select the ICD Medical Groups tab
    Then the ICD Medical tab should be active with its current content or empty state
    When I select the ICD Custom Groups tab
    Then the normal ICD Custom Group list should return

  @ICD-08
  Scenario: ICD-08 Open a New Custom Group form and cancel or close it
    When I open the ICD New Custom Group form
    Then the ICD create form fields and member controls should be visible
    When I enter temporary ICD group details
    And I cancel the ICD group form
    Then the ICD group form should be closed
    When I open the ICD New Custom Group form
    Then the ICD create form should be reset
    When I close the ICD group form
    Then the ICD group form should be closed
    And no ICD application data write should have been attempted

  @ICD-09
  Scenario Outline: ICD-09 Validate Group Name minimum length
    When I open the ICD New Custom Group form
    And I enter the ICD Group Name "<name>"
    Then the ICD group form should have no selected members
    When I trigger validation on the incomplete ICD group form
    Then the ICD Group Name minimum length error should be visible
    When I cancel the ICD group form
    Then the ICD group form should be closed
    And no ICD application data write should have been attempted

    Examples:
      | name |
      |      |
      | A    |

  @ICD-10
  Scenario: ICD-10 Validate that at least one member is required
    When I open the ICD New Custom Group form
    And I enter temporary ICD group details
    Then the ICD group form should have no selected members
    When I trigger validation on the incomplete ICD group form
    Then the ICD required member error should be visible
    When I cancel the ICD group form
    Then the ICD group form should be closed
    And no ICD application data write should have been attempted

  @ICD-11
  Scenario: ICD-11 Search select and remove a diagnosis reference code
    When I open the ICD New Custom Group form
    And I select the ICD Code members tab
    Given an available diagnosis reference and its description are discovered
    When I search ICD members by the discovered code
    Then the discovered ICD code and description should be returned
    When I toggle the discovered ICD code option
    Then exactly one discovered ICD member should be selected
    When I remove the discovered ICD code chip
    Then the discovered ICD code should be unselected with no chips
    When I cancel the ICD group form
    Then the ICD group form should be closed

  @ICD-12
  Scenario: ICD-12 Search diagnosis references by description
    When I open the ICD New Custom Group form
    And I select the ICD Code members tab
    Given an available diagnosis reference and its description are discovered
    When I search ICD members by the discovered description
    Then the discovered ICD code and description should be returned
    When I cancel the ICD group form
    Then the ICD group form should be closed

  @ICD-13
  Scenario: ICD-13 Toggle an already selected diagnosis code off
    When I open the ICD New Custom Group form
    And I select the ICD Code members tab
    Given an available diagnosis reference and its description are discovered
    When I search ICD members by the discovered code
    Then the discovered ICD code and description should be returned
    When I toggle the discovered ICD code option
    Then exactly one discovered ICD member should be selected
    When I clear the ICD reference search
    Then the ICD reference search and its results should be cleared
    When I search ICD members by the discovered code
    Then the discovered ICD code and description should be returned
    And exactly one discovered ICD member should be selected
    When I toggle the discovered ICD code option
    Then the discovered ICD code should be unselected with no chips
    When I cancel the ICD group form
    Then the ICD group form should be closed

  @ICD-14
  Scenario: ICD-14 Show no matching diagnosis reference results
    When I open the ICD New Custom Group form
    And I select the ICD Code members tab
    And I search ICD members with a unique nonmatching reference query
    Then no matching diagnosis references should be returned
    When I cancel the ICD group form
    Then the ICD group form should be closed

  @ICD-15
  Scenario: ICD-15 Select and remove an active nested Custom Group without saving
    When I open the ICD New Custom Group form
    And I select the ICD Custom Group members tab
    Given an active diagnosis Custom Group is discovered for nesting
    When I search for the discovered nested ICD Custom Group
    Then the exact discovered nested ICD Custom Group option should be shown
    When I select the discovered nested ICD Custom Group
    Then exactly one nested ICD Custom Group should be selected
    When I remove the discovered nested ICD Custom Group chip
    Then the nested ICD Custom Group should be unselected with no chips
    When I cancel the ICD group form
    Then the ICD group form should be closed

  @ICD-16
  Scenario Outline: ICD-16 Verify Edit prepopulation and discard temporary changes
    Given an independent ICD Edit baseline with a direct diagnosis member is captured
    When I search for the captured ICD "Edit" group
    Then the captured ICD "Edit" group should appear in search
    When I open the captured ICD "Edit" group View drawer
    Then the captured ICD "Edit" group details should match its baseline
    When I open ICD Edit from the View drawer
    Then the ICD Edit form should be prepopulated from its baseline
    When I modify the ICD Edit description without saving
    And I remove a direct ICD member from the unsaved Edit form
    Then the temporary ICD Edit changes should be local to the form
    When I dismiss the ICD Edit form using "<action>"
    Then the ICD group form should be closed
    And the captured ICD "Edit" group should remain unchanged in storage
    When I open the captured ICD "Edit" group View drawer
    Then the captured ICD "Edit" group details should match its baseline
    When I close the ICD group View drawer
    Then the ICD group View drawer should be closed

    Examples:
      | action |
      | Cancel |
      | Close  |

  @ICD-17
  Scenario Outline: ICD-17 Filter Custom Groups by status and restore All
    When I filter ICD Custom Groups by "<status>" status
    Then the ICD status filter and its results should match "<status>"
    When I restore the ICD Custom Group status filter to All
    Then the ICD All filter should restore the unfiltered request and list

    Examples:
      | status   |
      | Active   |
      | Inactive |

  @ICD-18
  Scenario: ICD-18 Inspect the exact group Delete confirmation and cancel
    Given an independent ICD Delete target baseline is captured
    When I search for the captured ICD "Delete" group
    Then the captured ICD "Delete" group should appear in search
    When I open Delete confirmation for the exact captured ICD group
    Then the ICD Delete confirmation should identify the target and explain soft deletion
    When I cancel the ICD Delete confirmation
    Then the ICD Delete modal should close and the same group row should remain
    And the captured ICD "Delete" group should remain unchanged in storage
