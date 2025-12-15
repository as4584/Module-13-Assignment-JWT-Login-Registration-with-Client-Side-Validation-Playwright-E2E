import { test, expect, Page } from '@playwright/test';

/**
 * Generate a unique email for each test run to avoid collisions.
 */
function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `testuser_${timestamp}_${random}@example.com`;
}

/**
 * Helper to clear localStorage before each test.
 */
async function clearStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Helper to get access token from localStorage.
 */
async function getAccessToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => localStorage.getItem('access_token'));
}

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/static/register.html');
    await clearStorage(page);
  });

  test('should display registration form elements', async ({ page }) => {
    // Verify all form elements are present
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
  });

  test('positive: should register a valid user and store token', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();
    const validPassword = 'SecurePassword123!';

    // Fill in the registration form
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill(validPassword);
    await page.locator('#confirmPassword').fill(validPassword);

    // Submit the form
    await page.locator('#submitBtn').click();

    // Wait for success message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/success/);
    await expect(page.locator('#message')).toContainText('Registration successful');

    // Verify token is stored in localStorage
    const token = await getAccessToken(page);
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);
  });

  test('negative: should show error for short password (client-side validation)', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();
    const shortPassword = 'short';

    // Fill in the registration form with short password
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill(shortPassword);
    await page.locator('#confirmPassword').fill(shortPassword);

    // Submit the form
    await page.locator('#submitBtn').click();

    // Should show validation error message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('Password must be at least 8 characters');

    // Verify no token is stored
    const token = await getAccessToken(page);
    expect(token).toBeFalsy();
  });

  test('negative: should show error when passwords do not match', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();

    // Fill in the registration form with mismatched passwords
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('SecurePassword123!');
    await page.locator('#confirmPassword').fill('DifferentPassword123!');

    // Submit the form
    await page.locator('#submitBtn').click();

    // Should show validation error message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('Passwords do not match');

    // Verify no token is stored
    const token = await getAccessToken(page);
    expect(token).toBeFalsy();
  });

  test('negative: should show error for invalid email format', async ({ page }) => {
    // Fill in the registration form with invalid email
    await page.locator('#email').fill('invalid-email');
    await page.locator('#password').fill('SecurePassword123!');
    await page.locator('#confirmPassword').fill('SecurePassword123!');

    // Submit the form
    await page.locator('#submitBtn').click();

    // Should show validation error message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('valid email');

    // Verify no token is stored
    const token = await getAccessToken(page);
    expect(token).toBeFalsy();
  });

  test('negative: should show error for duplicate email registration', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();
    const validPassword = 'SecurePassword123!';

    // First registration (should succeed)
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill(validPassword);
    await page.locator('#confirmPassword').fill(validPassword);
    await page.locator('#submitBtn').click();
    
    await expect(page.locator('#message')).toHaveClass(/success/);
    
    // Clear storage and reload page for second attempt
    await clearStorage(page);
    await page.goto('/static/register.html');

    // Second registration with same email (should fail)
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill(validPassword);
    await page.locator('#confirmPassword').fill(validPassword);
    await page.locator('#submitBtn').click();

    // Should show error message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('already registered');
  });
});

test.describe('Login Page', () => {
  const testEmail = generateUniqueEmail();
  const testPassword = 'SecurePassword123!';

  test.beforeAll(async ({ request }) => {
    // Register a test user via API for login tests
    await request.post('/register', {
      data: {
        email: testEmail,
        password: testPassword,
        confirm_password: testPassword,
      },
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/static/login.html');
    await clearStorage(page);
  });

  test('should display login form elements', async ({ page }) => {
    // Verify all form elements are present
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#submitBtn')).toBeVisible();
  });

  test('positive: should login with correct credentials and store token', async ({ page }) => {
    // Fill in the login form
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);

    // Submit the form
    await page.locator('#submitBtn').click();

    // Wait for success message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/success/);
    await expect(page.locator('#message')).toContainText('Login successful');

    // Verify token is stored in localStorage
    const token = await getAccessToken(page);
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(10);
  });

  test('negative: should show error for wrong password', async ({ page }) => {
    // Fill in the login form with wrong password
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill('WrongPassword123!');

    // Submit the form
    await page.locator('#submitBtn').click();

    // Should show error message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('Invalid credentials');

    // Verify no token is stored
    const token = await getAccessToken(page);
    expect(token).toBeFalsy();
  });

  test('negative: should show error for non-existent user', async ({ page }) => {
    // Fill in the login form with non-existent user
    await page.locator('#email').fill('nonexistent@example.com');
    await page.locator('#password').fill('SomePassword123!');

    // Submit the form
    await page.locator('#submitBtn').click();

    // Should show error message
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('Invalid credentials');

    // Verify no token is stored
    const token = await getAccessToken(page);
    expect(token).toBeFalsy();
  });

  test('negative: should show error for short password (client-side validation)', async ({ page }) => {
    // Fill in the login form with short password
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill('short');

    // Submit the form
    await page.locator('#submitBtn').click();

    // Should show client-side validation error
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('Password must be at least 8 characters');

    // Verify no token is stored
    const token = await getAccessToken(page);
    expect(token).toBeFalsy();
  });

  test('negative: should show error for invalid email format', async ({ page }) => {
    // Fill in the login form with invalid email
    await page.locator('#email').fill('invalid-email');
    await page.locator('#password').fill('SecurePassword123!');

    // Submit the form
    await page.locator('#submitBtn').click();

    // Should show validation error
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#message')).toHaveClass(/error/);
    await expect(page.locator('#message')).toContainText('valid email');

    // Verify no token is stored
    const token = await getAccessToken(page);
    expect(token).toBeFalsy();
  });
});
