import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let testEnv: RulesTestEnvironment;

const PROJECT_ID = 'collab-task-manager-test';

describe('Requirement 8: Firestore Security Rules & Protected Data Verification', () => {
  beforeAll(async () => {
    const rules = readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8');
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it('blocks unauthenticated users from reading or writing anything', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();

    const userRef = doc(unauthedDb, 'users', 'user-1');
    const projectRef = doc(unauthedDb, 'projects', 'proj-1');
    const taskRef = doc(unauthedDb, 'projects', 'proj-1', 'tasks', 'task-1');

    await assertFails(getDoc(userRef));
    await assertFails(getDoc(projectRef));
    await assertFails(getDoc(taskRef));

    await assertFails(setDoc(userRef, { email: 'hacker@evil.com' }));
    await assertFails(setDoc(projectRef, { name: 'Hacked Project' }));
    await assertFails(setDoc(taskRef, { title: 'Hacked Task' }));
  });

  it('allows authenticated users to create and manage their own user profile, but not others', async () => {
    const aliceDb = testEnv.authenticatedContext('alice-uid', { email: 'alice@team.com' }).firestore();
    const bobDb = testEnv.authenticatedContext('bob-uid', { email: 'bob@team.com' }).firestore();

    // Alice creates her own profile -> Succeeds
    await assertSucceeds(
      setDoc(doc(aliceDb, 'users', 'alice-uid'), {
        uid: 'alice-uid',
        email: 'alice@team.com',
        displayName: 'Alice Lead',
      })
    );

    // Alice tries to overwrite Bob's profile -> Fails
    await assertFails(
      setDoc(doc(aliceDb, 'users', 'bob-uid'), {
        uid: 'bob-uid',
        email: 'fake-bob@team.com',
        displayName: 'Impostor Bob',
      })
    );

    // Bob can read Alice's profile to collaborate -> Succeeds
    await assertSucceeds(getDoc(doc(bobDb, 'users', 'alice-uid')));
  });

  it('enforces that unauthorized users cannot read or modify private projects', async () => {
    const aliceDb = testEnv.authenticatedContext('alice-uid', { email: 'alice@team.com' }).firestore();
    const bobDb = testEnv.authenticatedContext('bob-uid', { email: 'bob@team.com' }).firestore();

    // Alice creates a project
    const projectRefAlice = doc(aliceDb, 'projects', 'secret-project');
    await assertSucceeds(
      setDoc(projectRefAlice, {
        name: 'Top Secret Project',
        description: 'Internal only',
        ownerId: 'alice-uid',
        ownerEmail: 'alice@team.com',
        members: ['alice-uid'],
        memberEmails: ['alice@team.com'],
      })
    );

    // Bob is NOT a member of secret-project.
    const projectRefBob = doc(bobDb, 'projects', 'secret-project');

    // Bob attempts to read the project -> BLOCKED by security rules
    await assertFails(getDoc(projectRefBob));

    // Bob attempts to modify the project -> BLOCKED
    await assertFails(updateDoc(projectRefBob, { name: 'Compromised Project' }));

    // Bob attempts to delete the project -> BLOCKED
    await assertFails(deleteDoc(projectRefBob));
  });

  it('enforces that unauthorized users cannot read or write tasks belonging to other projects', async () => {
    const aliceDb = testEnv.authenticatedContext('alice-uid', { email: 'alice@team.com' }).firestore();
    const bobDb = testEnv.authenticatedContext('bob-uid', { email: 'bob@team.com' }).firestore();

    // 1. Setup project with Alice as sole member
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'projects', 'proj-alpha'), {
        name: 'Project Alpha',
        ownerId: 'alice-uid',
        members: ['alice-uid'],
      });
    });

    // 2. Alice creates a task in Project Alpha -> Succeeds
    const taskRefAlice = doc(aliceDb, 'projects', 'proj-alpha', 'tasks', 'task-alpha-1');
    await assertSucceeds(
      setDoc(taskRefAlice, {
        projectId: 'proj-alpha',
        title: 'Confidential Task',
        status: 'TODO',
        progress: 0,
        createdBy: 'alice-uid',
        assignedTo: 'alice-uid',
      })
    );

    // 3. Bob (not in Project Alpha) attempts to read the task -> BLOCKED
    const taskRefBob = doc(bobDb, 'projects', 'proj-alpha', 'tasks', 'task-alpha-1');
    await assertFails(getDoc(taskRefBob));

    // 4. Bob attempts to modify the task -> BLOCKED
    await assertFails(updateDoc(taskRefBob, { status: 'DONE', progress: 100 }));

    // 5. Bob attempts to create a task inside Project Alpha -> BLOCKED
    await assertFails(
      setDoc(doc(bobDb, 'projects', 'proj-alpha', 'tasks', 'unauthorized-task'), {
        projectId: 'proj-alpha',
        title: 'Intruder Task',
        status: 'TODO',
        progress: 0,
        createdBy: 'bob-uid',
        assignedTo: 'bob-uid',
      })
    );
  });

  it('allows members to collaborate, read/create tasks, and update status & progress once added', async () => {
    const aliceDb = testEnv.authenticatedContext('alice-uid', { email: 'alice@team.com' }).firestore();
    const bobDb = testEnv.authenticatedContext('bob-uid', { email: 'bob@team.com' }).firestore();

    // 1. Alice creates project and adds Bob to members
    const projectRef = doc(aliceDb, 'projects', 'shared-project');
    await assertSucceeds(
      setDoc(projectRef, {
        name: 'Shared Project',
        description: 'Collaborative board',
        ownerId: 'alice-uid',
        ownerEmail: 'alice@team.com',
        members: ['alice-uid', 'bob-uid'],
        memberEmails: ['alice@team.com', 'bob@team.com'],
      })
    );

    // 2. Bob can now read the shared project -> Succeeds
    await assertSucceeds(getDoc(doc(bobDb, 'projects', 'shared-project')));

    // 3. Alice creates and assigns task to Bob -> Succeeds
    const taskRef = doc(aliceDb, 'projects', 'shared-project', 'tasks', 'shared-task-1');
    await assertSucceeds(
      setDoc(taskRef, {
        projectId: 'shared-project',
        title: 'Build API Integration',
        status: 'TODO',
        progress: 0,
        createdBy: 'alice-uid',
        assignedTo: 'bob-uid',
      })
    );

    // 4. Bob can read the task via get and list -> Succeeds
    await assertSucceeds(getDoc(doc(bobDb, 'projects', 'shared-project', 'tasks', 'shared-task-1')));
    await assertSucceeds(getDocs(collection(bobDb, 'projects', 'shared-project', 'tasks')));

    // 5. Bob updates task status and progress -> Succeeds
    await assertSucceeds(
      updateDoc(doc(bobDb, 'projects', 'shared-project', 'tasks', 'shared-task-1'), {
        status: 'IN_PROGRESS',
        progress: 50,
      })
    );

    // 6. Non-owner (Bob) cannot delete the project -> Fails
    await assertFails(deleteDoc(doc(bobDb, 'projects', 'shared-project')));

    // 7. Owner (Alice) can delete the project -> Succeeds
    await assertSucceeds(deleteDoc(doc(aliceDb, 'projects', 'shared-project')));
  });
});
