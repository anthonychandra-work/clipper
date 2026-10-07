import {
  expect,
  listProjects,
  newProjectForm,
  openNewProjectSheet,
  pressFindClips,
  readShownProblem,
  test,
} from './support';

const PHONE = { width: 390, height: 844 };
const THREE_GB_IN_BYTES = String(3 * 1024 ** 3);

test.use({ viewport: PHONE });

test.afterEach(async ({ tool }) => {
  await tool.stop();
  await tool.start();
});

test('with 3 GB reported free, Find Clips creates nothing and gives the reason under the source', async ({
  page,
  request,
  tool,
  fixtureServer,
}) => {
  await tool.stop();
  await tool.start({ CLIPPER_REPORTED_FREE_BYTES: THREE_GB_IN_BYTES });
  const projectsBefore = await listProjects(request);
  await openNewProjectSheet(page);
  await page.locator('#draft-link').fill(`${fixtureServer.address}/talk.mp4`);

  await pressFindClips(page);
  const problem = await readShownProblem(page);

  expect(problem).toEqual({
    section: 'Source',
    message:
      'Only 3.0 GB is free on this Mac, and a new project needs 5 GB. Delete a project or free some space.',
  });
  await expect(page.locator('#draft-link')).toBeFocused();
  await expect(page.locator('#draft-link')).toHaveAttribute('aria-invalid', 'true');
  await expect(newProjectForm(page)).toBeVisible();
  await expect(page).toHaveURL('/new');
  expect(await listProjects(request)).toEqual(projectsBefore);
});
