import { test, expect } from '@playwright/test';

test.describe('Firebase Collaborative Project & Task MVP Workflow', () => {
  test('Completes the entire 9-step MVP workflow across 2 browser sessions with real-time sync', async ({
    browser,
  }) => {
    // Generate unique credentials to ensure test isolation
    const uniqueId = Date.now();
    const aliceEmail = `alice_${uniqueId}@collabtest.org`;
    const bobEmail = `bob_${uniqueId}@collabtest.org`;
    const password = 'TestPassword123!';

    // Create 2 independent browser sessions (contexts)
    const contextAlice = await browser.newContext();
    const contextBob = await browser.newContext();

    const pageAlice = await contextAlice.newPage();
    const pageBob = await contextBob.newPage();

    // ==========================================
    // STEP 1: Register and Log In
    // ==========================================
    // 1.1 Alice registers in Session 1
    await pageAlice.goto('http://localhost:5173');
    await pageAlice.getByRole('button', { name: 'Create Account' }).click();
    await pageAlice.getByPlaceholder('e.g. Jane Doe').fill('Alice Lead');
    await pageAlice.getByPlaceholder('you@company.com').fill(aliceEmail);
    await pageAlice.getByPlaceholder('••••••••').fill(password);
    await pageAlice.getByRole('button', { name: 'Register & Continue' }).click();

    // Verify Alice is logged in
    await expect(pageAlice.getByText('Alice Lead')).toBeVisible({ timeout: 15000 });
    await expect(pageAlice.getByText('Sign Out')).toBeVisible();

    // 1.2 Bob registers in Session 2
    await pageBob.goto('http://localhost:5173');
    await pageBob.getByRole('button', { name: 'Create Account' }).click();
    await pageBob.getByPlaceholder('e.g. Jane Doe').fill('Bob Engineer');
    await pageBob.getByPlaceholder('you@company.com').fill(bobEmail);
    await pageBob.getByPlaceholder('••••••••').fill(password);
    await pageBob.getByRole('button', { name: 'Register & Continue' }).click();

    // Verify Bob is logged in
    await expect(pageBob.getByText('Bob Engineer')).toBeVisible({ timeout: 15000 });
    await expect(pageBob.getByText('No projects yet. Create one to get started!')).toBeVisible();

    // ==========================================
    // STEP 2: Create a Project
    // ==========================================
    // Alice creates "Team Collab Alpha"
    await pageAlice.getByRole('button', { name: 'New Project' }).click();
    await pageAlice.getByPlaceholder('e.g. Mobile App Redesign').fill('Team Collab Alpha');
    await pageAlice.getByPlaceholder('Brief outline of goals, deliverables, or scope...').fill(
      'Core sprint deliverables and task management tracking.'
    );
    await pageAlice.getByRole('button', { name: 'Create Project' }).click();

    // Verify project appears in Alice's session
    await expect(pageAlice.getByLabel('Active Project')).toContainText('Team Collab Alpha');
    await expect(
      pageAlice.getByRole('main').getByText('Core sprint deliverables and task management tracking.')
    ).toBeVisible();

    // ==========================================
    // STEP 3: Add Project Members & Real-time Sync
    // ==========================================
    // Alice adds Bob to the project
    await pageAlice.getByRole('button', { name: /Members/i }).click();
    await pageAlice.getByPlaceholder('e.g. bob@teamcollab.io').fill(bobEmail);
    await pageAlice.getByRole('button', { name: 'Add Member' }).click();

    // Confirm success message in Alice's modal
    await expect(pageAlice.getByText(/Successfully added/i)).toBeVisible();
    await pageAlice.getByRole('button', { name: 'Close' }).click();

    // STEP 7 Verification A: Bob's session updates in REAL TIME without reload
    await expect(pageBob.getByLabel('Active Project')).toContainText('Team Collab Alpha', { timeout: 15000 });
    await expect(pageBob.getByText('Members (2)')).toBeVisible();

    // ==========================================
    // STEP 4: Create and Assign a Task
    // ==========================================
    // Alice creates task and assigns to Bob
    await pageAlice.getByRole('button', { name: 'Create Task' }).first().click();
    await pageAlice.getByPlaceholder('e.g. Implement Firestore security rules').fill(
      'Build Realtime Dashboard'
    );
    await pageAlice.getByPlaceholder('Detailed instructions or acceptance criteria...').fill(
      'Hook up onSnapshot listeners and compute dynamic stats.'
    );

    // Select Bob from project members dropdown (second option)
    await pageAlice.getByLabel('Assign Member').selectOption({ index: 1 });

    // Select Priority Urgent
    await pageAlice.getByLabel('Task Priority').selectOption('URGENT');

    // Submit task
    await pageAlice.getByRole('button', { name: 'Create & Assign Task' }).click();

    // ==========================================
    // STEP 6: Verify Task Saved in Firestore & Rendered
    // ==========================================
    // Check in Alice's session
    await expect(pageAlice.getByText('Build Realtime Dashboard')).toBeVisible();
    await expect(pageAlice.getByRole('main').getByText('Urgent', { exact: true })).toBeVisible();
    await expect(pageAlice.getByText(/id:/)).toBeVisible();

    // STEP 7 Verification B: Bob's session immediately sees the new task in real time
    await expect(pageBob.getByText('Build Realtime Dashboard')).toBeVisible({ timeout: 15000 });
    await expect(pageBob.getByRole('main').getByText('Bob Engineer')).toBeVisible();

    // ==========================================
    // STEP 9: Real Dashboard Statistics Verification (Initial State)
    // ==========================================
    // Total Tasks = 1, To Do = 1
    await expect(pageAlice.getByTestId('stat-total-tasks')).toContainText('1');
    await expect(pageAlice.getByTestId('stat-todo-tasks')).toContainText('1');

    // ==========================================
    // STEP 5: Update Task Status and Progress
    // ==========================================
    // In Bob's session (Session 2), Bob changes status to 'In Progress' and sets progress to 50%
    await pageBob.getByLabel('Task Status').selectOption('IN_PROGRESS');

    // Click 50% progress preset
    await pageBob.getByRole('button', { name: '50%' }).click();

    // STEP 7 Verification C: Alice's session updates in real-time
    await expect(pageAlice.getByTestId('stat-inprogress-tasks')).toContainText('1', { timeout: 10000 });
    await expect(pageAlice.getByTestId('task-progress-value')).toHaveText('50%');

    // Bob marks task as Done (100%)
    await pageBob.getByLabel('Task Status').selectOption('DONE');

    // Alice's session updates in real-time to Completed
    await expect(pageAlice.getByTestId('stat-completed-tasks')).toContainText('1', { timeout: 10000 });
    await expect(pageAlice.getByTestId('stat-completed-tasks')).toContainText('100%');
    await expect(pageAlice.getByTestId('task-progress-value')).toHaveText('100%');

    // Clean up browser sessions
    await contextAlice.close();
    await contextBob.close();
  });
});
