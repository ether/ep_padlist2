import {expect, test} from '@playwright/test';
import {goToNewPad} from 'ep_etherpad-lite/tests/frontend-new/helper/padHelper';

const LIST_URL = 'http://localhost:9001/list';

test.describe('ep_padlist2 /list', () => {
  test('lists the pad and filters it with the search box', async ({page}) => {
    // Regression guard for ether/ether-plugins#79: the page used to load
    // jQuery/html10n from paths core no longer serves, so main.js died with
    // "$ is not defined" and typing in the search box did nothing.
    const pageErrors: string[] = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    const padId = await goToNewPad(page);

    // The pad may not have been flushed to the database yet.
    await expect(async () => {
      await page.goto(LIST_URL);
      await expect(page.locator('li a', {hasText: padId})).toBeVisible({timeout: 2000});
    }).toPass({timeout: 30000});

    const padLink = page.locator('li a', {hasText: padId});
    const searchBox = page.locator('input[type="search"]');

    // A query that matches hides nothing relevant...
    await searchBox.fill(padId.slice(-12));
    await expect(padLink).toBeVisible();

    // ...and one that doesn't match hides the pad.
    await searchBox.fill('zzz-no-such-pad-zzz');
    await expect(padLink).toBeHidden();

    // Regex metacharacters must not blow up the filter.
    await searchBox.fill('((');
    await expect(padLink).toBeHidden();

    // Clearing the box shows everything again.
    await searchBox.fill('');
    await expect(padLink).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('localizes the page from the plugin locales', async ({page}) => {
    await page.goto(LIST_URL);
    // Loaded from locales/en.json via data-l10n-id, not from the template's
    // hardcoded fallback text.
    await expect(page.locator('input[type="search"]'))
        .toHaveAttribute('placeholder', 'Search pads');
    await expect(page.locator('input[type="search"]'))
        .toHaveAttribute('aria-label', 'Search pads');
    await expect(page.locator('h1')).toHaveText('Pads');
  });
});

test.describe('ep_padlist2 /list in pt-BR', () => {
  test.use({locale: 'pt-BR'});

  test('uses the regional locale, not the base language', async ({page}) => {
    // The browser reports "pt-BR" but the locale index is keyed "pt-br", so a
    // case-sensitive lookup would silently fall back to "pt".
    await page.goto(LIST_URL);
    await expect(page.locator('input[type="search"]'))
        .toHaveAttribute('placeholder', 'Pesquisar notas');
    await expect(page.locator('h1')).toHaveText('Notas');
  });
});
