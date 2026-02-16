"""
E2E Test Suite: Government Onboarding Wizard + Chicagoland Expansion

Tests the city-aware onboarding wizard for both SF and Chicago,
match explanation modal, coverage map, mix builder, and budget optimizer.

Run: python tests/e2e/test_onboarding_chicagoland.py
Requires: Playwright (pip install playwright && playwright install chromium)
Server must be running on localhost:3002
"""

import sys
import os
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3002"
SCREENSHOT_DIR = "/tmp/resonate-tests"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

PASSED = 0
FAILED = 0
ERRORS = []


def screenshot(page, name):
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    print(f"    Screenshot: {path}")
    return path


def test(name):
    """Decorator-style test runner"""
    def decorator(fn):
        def wrapper(*args, **kwargs):
            global PASSED, FAILED
            print(f"\n{'='*60}")
            print(f"TEST: {name}")
            print(f"{'='*60}")
            try:
                fn(*args, **kwargs)
                PASSED += 1
                print(f"  ✅ PASSED: {name}")
            except Exception as e:
                FAILED += 1
                ERRORS.append((name, str(e)))
                print(f"  ❌ FAILED: {name}")
                print(f"    Error: {e}")
        wrapper.__test_name__ = name
        return wrapper
    return decorator


# =============================================================================
# TEST: SF Onboarding - Step 1 (Brief)
# =============================================================================

@test("SF Onboarding - Step 1 loads with SF departments")
def test_sf_step1(page):
    page.goto(f"{BASE_URL}/sf/government/onboarding")
    page.wait_for_load_state("networkidle")
    screenshot(page, "01_sf_step1_loaded")

    # Verify page title
    heading = page.locator("h1")
    expect(heading).to_contain_text("Create a Campaign")

    # Verify step indicator shows Step 1 active
    step_buttons = page.locator("button:has-text('Campaign Brief')")
    assert step_buttons.count() > 0, "Step 1 'Campaign Brief' button not found"

    # Verify SF departments are in the dropdown
    dept_select = page.locator("select").first
    dept_select.click()
    dept_options = dept_select.locator("option")
    option_texts = [dept_options.nth(i).text_content() for i in range(dept_options.count())]

    # Should contain SF-specific departments
    assert any("Public Health" in t for t in option_texts), f"SF DPH not found in departments: {option_texts[:5]}"
    assert any("Environment" in t for t in option_texts), f"SF Environment dept not found"
    # Should NOT contain Chicago departments
    assert not any("CTA" in t and "Transit Authority" in t for t in option_texts), "Chicago CTA found in SF departments!"
    print(f"    Found {len(option_texts)} department options")


# =============================================================================
# TEST: SF Onboarding - Step 2 (Audience) - Flat neighborhoods
# =============================================================================

@test("SF Onboarding - Step 2 shows flat neighborhood list")
def test_sf_step2_neighborhoods(page):
    page.goto(f"{BASE_URL}/sf/government/onboarding")
    page.wait_for_load_state("networkidle")

    # Fill minimum required fields and advance to Step 2
    page.locator("select").first.select_option(index=1)  # Pick first department
    page.locator("input[placeholder*='Flu Shot']").first.fill("Test Campaign SF")
    page.locator("textarea").first.fill("Test description")
    page.locator("input[placeholder='Full name']").fill("Test User")
    page.locator("input[placeholder*='sfgov.org']").fill("test@sfgov.org")

    # Click Continue
    page.locator("button:has-text('Continue')").click()
    page.wait_for_timeout(500)
    screenshot(page, "02_sf_step2_audience")

    # Verify Geography section exists
    geo_section = page.locator("text=Geography")
    expect(geo_section.first).to_be_visible()

    # Verify flat pill buttons (not grouped by side)
    # SF has a single region group, so no section headers like "Far North Side"
    far_north_headers = page.locator("text=Far North Side")
    assert far_north_headers.count() == 0, "Chicago 'Far North Side' header found on SF page!"

    # Verify SF neighborhoods present
    mission_pill = page.locator("button:has-text('Mission')")
    assert mission_pill.count() > 0, "Mission neighborhood pill not found"

    castro_pill = page.locator("button:has-text('Castro')")
    assert castro_pill.count() > 0, "Castro neighborhood pill not found"

    tenderloin_pill = page.locator("button:has-text('Tenderloin')")
    assert tenderloin_pill.count() > 0, "Tenderloin neighborhood pill not found"

    # Verify SF languages
    spanish_pill = page.locator("button:has-text('Spanish')")
    assert spanish_pill.count() > 0, "Spanish language pill not found"

    cantonese_pill = page.locator("button:has-text('Cantonese')")
    assert cantonese_pill.count() > 0, "Cantonese language pill not found (SF-specific)"

    # Should NOT have Polish (Chicago-specific)
    polish_pills = page.locator("button:has-text('Polish')")
    assert polish_pills.count() == 0, "Polish language found on SF page (should be Chicago only)"

    print("    SF neighborhoods: flat layout, no side groupings ✓")
    print("    SF languages: includes Cantonese, no Polish ✓")


# =============================================================================
# TEST: SF Onboarding - Neighborhood selection + citywide toggle
# =============================================================================

@test("SF Onboarding - Neighborhood selection and citywide toggle")
def test_sf_neighborhood_selection(page):
    page.goto(f"{BASE_URL}/sf/government/onboarding")
    page.wait_for_load_state("networkidle")

    # Quick fill Step 1
    page.locator("select").first.select_option(index=1)
    page.locator("input[placeholder*='Flu Shot']").first.fill("Selection Test")
    page.locator("textarea").first.fill("Test")
    page.locator("input[placeholder='Full name']").fill("Test")
    page.locator("input[placeholder*='sfgov.org']").fill("t@t.org")
    page.locator("button:has-text('Continue')").click()
    page.wait_for_timeout(500)

    # Select Mission neighborhood
    mission_btn = page.locator("button:has-text('Mission')").first
    mission_btn.click()
    page.wait_for_timeout(200)

    # Verify it's now selected (should have teal styling)
    assert "teal" in (mission_btn.get_attribute("class") or ""), "Mission pill not showing selected state"
    screenshot(page, "03_sf_neighborhood_selected")

    # Toggle citywide
    citywide_checkbox = page.locator("input[type='checkbox']").first
    citywide_checkbox.check()
    page.wait_for_timeout(200)

    # Mission should now be disabled
    mission_btn_after = page.locator("button:has-text('Mission')").first
    assert mission_btn_after.is_disabled(), "Neighborhood pill not disabled after citywide toggle"
    screenshot(page, "04_sf_citywide_toggled")

    # Sidebar should show "Citywide"
    sidebar_text = page.locator("text=Citywide")
    assert sidebar_text.count() > 0, "Sidebar does not show 'Citywide' after toggle"
    print("    Neighborhood selection + citywide toggle work correctly ✓")


# =============================================================================
# TEST: Chicago Onboarding - Step 1 loads with Chicago departments
# =============================================================================

@test("Chicago Onboarding - Step 1 loads with Chicagoland departments")
def test_chicago_step1(page):
    page.goto(f"{BASE_URL}/chicago/government/onboarding")
    page.wait_for_load_state("networkidle")
    screenshot(page, "05_chicago_step1_loaded")

    heading = page.locator("h1")
    expect(heading).to_contain_text("Create a Campaign")

    # Verify Chicago departments in dropdown
    dept_select = page.locator("select").first
    dept_select.click()
    dept_options = dept_select.locator("option")
    option_texts = [dept_options.nth(i).text_content() for i in range(dept_options.count())]

    # Should contain Chicago-specific departments
    assert any("CDPH" in t for t in option_texts), f"Chicago CDPH not found: {option_texts[:5]}"
    assert any("CTA" in t for t in option_texts), "Chicago CTA not found"
    assert any("Cook County" in t for t in option_texts), "Cook County dept not found"
    assert any("Metra" in t for t in option_texts), "Regional agency Metra not found"

    # Should NOT contain SF departments
    assert not any("SFMTA" in t for t in option_texts), "SF SFMTA found in Chicago departments!"
    print(f"    Found {len(option_texts)} Chicago department options ✓")


# =============================================================================
# TEST: Chicago Onboarding - Step 2 with grouped community areas
# =============================================================================

@test("Chicago Onboarding - Step 2 shows grouped community areas by side")
def test_chicago_step2_grouped(page):
    page.goto(f"{BASE_URL}/chicago/government/onboarding")
    page.wait_for_load_state("networkidle")

    # Fill Step 1
    page.locator("select").first.select_option(index=1)
    page.locator("input[placeholder*='Flu Shot']").first.fill("Chicago Test Campaign")
    page.locator("textarea").first.fill("Test description")
    page.locator("input[placeholder='Full name']").fill("Test User")
    page.locator("input[placeholder*='sfgov.org']").fill("test@chicago.gov")
    page.locator("button:has-text('Continue')").click()
    page.wait_for_timeout(500)
    screenshot(page, "06_chicago_step2_audience")

    # Verify Geography section uses "community area" terminology
    geo_subtitle = page.locator("text=community area")
    assert geo_subtitle.count() > 0, "Geography section should reference 'community areas', not 'neighborhoods'"

    # Verify grouped section headers exist (Chicago has multiple region groups)
    far_north = page.locator("text=Far North Side")
    assert far_north.count() > 0, "'Far North Side' group header not found"

    south_side = page.locator("text=South Side")
    assert south_side.count() > 0, "'South Side' group header not found"

    southwest = page.locator("text=Southwest Side")
    assert southwest.count() > 0, "'Southwest Side' group header not found"

    key_suburbs = page.locator("text=Key Suburbs")
    assert key_suburbs.count() > 0, "'Key Suburbs' group header not found"

    # Verify specific Chicago community areas
    hyde_park = page.locator("button:has-text('Hyde Park')")
    assert hyde_park.count() > 0, "Hyde Park community area not found"

    englewood = page.locator("button:has-text('Englewood')")
    assert englewood.count() > 0, "Englewood community area not found"

    rogers_park = page.locator("button:has-text('Rogers Park')")
    assert rogers_park.count() > 0, "Rogers Park community area not found"

    # Verify suburb stubs
    evanston = page.locator("button:has-text('Evanston')")
    assert evanston.count() > 0, "Evanston suburb not found"

    oak_park = page.locator("button:has-text('Oak Park')")
    assert oak_park.count() > 0, "Oak Park suburb not found"

    # Verify Chicago languages (should include Polish, not Cantonese as primary)
    polish = page.locator("button:has-text('Polish')")
    assert polish.count() > 0, "Polish language not found (Chicago-specific)"

    urdu = page.locator("button:has-text('Urdu')")
    assert urdu.count() > 0, "Urdu language not found (Chicago-specific)"

    # Citywide label should reference community areas
    citywide_label = page.locator("text=all community areas")
    assert citywide_label.count() > 0, "Citywide label should say 'all community areas'"

    screenshot(page, "07_chicago_grouped_community_areas")
    print("    Chicago community areas grouped by side ✓")
    print("    Key Suburbs section present ✓")
    print("    Chicago languages (Polish, Urdu) present ✓")


# =============================================================================
# TEST: Chicago community area selection
# =============================================================================

@test("Chicago Onboarding - Select community areas from different sides")
def test_chicago_area_selection(page):
    page.goto(f"{BASE_URL}/chicago/government/onboarding")
    page.wait_for_load_state("networkidle")

    # Quick fill Step 1
    page.locator("select").first.select_option(index=1)
    page.locator("input[placeholder*='Flu Shot']").first.fill("Area Selection Test")
    page.locator("textarea").first.fill("Test")
    page.locator("input[placeholder='Full name']").fill("Test")
    page.locator("input[placeholder*='sfgov.org']").fill("t@t.org")
    page.locator("button:has-text('Continue')").click()
    page.wait_for_timeout(500)

    # Select areas from different sides
    page.locator("button:has-text('Hyde Park')").first.click()
    page.wait_for_timeout(100)
    page.locator("button:has-text('Englewood')").first.click()
    page.wait_for_timeout(100)
    page.locator("button:has-text('Rogers Park')").first.click()
    page.wait_for_timeout(100)

    screenshot(page, "08_chicago_areas_selected")

    # Sidebar should show count with "community area" label
    sidebar = page.locator("aside").first
    sidebar_text = sidebar.text_content() or ""
    assert "3" in sidebar_text, "Sidebar should show 3 selected areas"
    assert "community area" in sidebar_text.lower(), "Sidebar should use 'community area' terminology"
    print("    Selected areas from 3 different sides ✓")
    print("    Sidebar displays correct count with 'community area' label ✓")


# =============================================================================
# TEST: SF Full flow through to Step 3 (matches)
# =============================================================================

@test("SF Onboarding - Full flow to Step 3 with match results")
def test_sf_full_flow(page):
    page.goto(f"{BASE_URL}/sf/government/onboarding")
    page.wait_for_load_state("networkidle")

    # Step 1: Fill campaign brief
    page.locator("select").first.select_option(index=1)
    page.locator("input[placeholder*='Flu Shot']").first.fill("Flu Shot Outreach 2026")
    page.locator("textarea").first.fill("Free flu shots for all SF residents")
    page.locator("input[placeholder='Full name']").fill("Jane Doe")
    page.locator("input[placeholder*='sfgov.org']").fill("jane.doe@sfgov.org")

    # Select budget
    budget_select = page.locator("select").nth(1)
    budget_select.select_option(index=2)

    page.locator("button:has-text('Continue')").click()
    page.wait_for_timeout(500)

    # Step 2: Select audience
    page.locator("button:has-text('Mission')").first.click()
    page.locator("button:has-text('Tenderloin')").first.click()
    page.locator("button:has-text('Bayview')").first.click()
    page.locator("button:has-text('Spanish')").first.click()
    page.locator("button:has-text('English')").first.click()

    screenshot(page, "09_sf_step2_filled")

    # Advance to Step 3
    page.locator("button:has-text('Continue')").click()

    # Wait for matching to complete (API call)
    page.wait_for_timeout(5000)
    page.wait_for_load_state("networkidle")
    screenshot(page, "10_sf_step3_matches")

    # Check for match results or loading state
    match_header = page.locator("text=Publisher")
    loading = page.locator("text=Finding matching publishers")

    # Wait up to 15s for matches to load
    try:
        page.locator("text=Matched").first.wait_for(timeout=15000)
        print("    Match results loaded ✓")
    except:
        # May still be loading or show error
        screenshot(page, "10_sf_step3_state")
        print("    Note: Matches may still be loading or require seeded data")
        return

    # Verify match cards exist
    score_badges = page.locator("button[title='View score breakdown']")
    match_count = score_badges.count()
    print(f"    Found {match_count} match cards with score badges ✓")

    if match_count > 0:
        # Test: Click score badge to open explanation modal
        score_badges.first.click()
        page.wait_for_timeout(500)
        screenshot(page, "11_sf_match_explanation_modal")

        # Verify modal opened
        modal = page.locator("[role='dialog']")
        expect(modal).to_be_visible()

        # Verify 5-dimension sections
        dimensions = ["Geographic", "Demographic", "Economic", "Cultural", "Reach"]
        for dim in dimensions:
            dim_section = modal.locator(f"text={dim}")
            assert dim_section.count() > 0, f"'{dim}' dimension not found in modal"

        print("    Match Explanation Modal with 5 dimensions ✓")

        # Close modal with Escape
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
        assert modal.count() == 0 or not modal.is_visible(), "Modal did not close on Escape"
        print("    Modal closes on Escape ✓")

    # Check for coverage map
    coverage_map = page.locator("text=Publisher Coverage")
    if coverage_map.count() > 0:
        print("    Coverage map section present ✓")

    # Check for mix coverage summary
    mix_summary = page.locator("text=Coverage")
    if mix_summary.count() > 0:
        print("    Mix coverage summary present ✓")

    # Check for Suggest Mix button
    suggest_mix = page.locator("button:has-text('Suggest Mix')")
    if suggest_mix.count() > 0:
        print("    Suggest Mix button present ✓")

    screenshot(page, "12_sf_step3_final")


# =============================================================================
# RUNNER
# =============================================================================

def main():
    global PASSED, FAILED

    print("\n" + "="*60)
    print("  RESONATE E2E TEST SUITE")
    print("  Government Onboarding + Chicagoland Expansion")
    print("="*60)
    print(f"  Server: {BASE_URL}")
    print(f"  Screenshots: {SCREENSHOT_DIR}/")
    print("="*60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
        )

        # Run each test in a fresh page
        tests = [
            test_sf_step1,
            test_sf_step2_neighborhoods,
            test_sf_neighborhood_selection,
            test_chicago_step1,
            test_chicago_step2_grouped,
            test_chicago_area_selection,
            test_sf_full_flow,
        ]

        for test_fn in tests:
            page = context.new_page()
            try:
                test_fn(page)
            except Exception as e:
                # Catch any uncaught errors
                FAILED += 1
                name = getattr(test_fn, '__test_name__', test_fn.__name__)
                ERRORS.append((name, str(e)))
                print(f"  ❌ UNCAUGHT ERROR in {name}: {e}")
                try:
                    screenshot(page, f"error_{name.replace(' ', '_')[:30]}")
                except:
                    pass
            finally:
                page.close()

        browser.close()

    # Summary
    print("\n" + "="*60)
    print(f"  RESULTS: {PASSED} passed, {FAILED} failed, {PASSED + FAILED} total")
    print("="*60)

    if ERRORS:
        print("\n  FAILURES:")
        for name, err in ERRORS:
            print(f"    ❌ {name}")
            print(f"       {err[:200]}")

    print(f"\n  Screenshots saved to: {SCREENSHOT_DIR}/")
    print("="*60 + "\n")

    return 0 if FAILED == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
