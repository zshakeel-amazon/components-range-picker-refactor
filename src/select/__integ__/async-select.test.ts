// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import useBrowser from '@cloudscape-design/browser-test-tools/use-browser';
import AsyncDropdownComponentPage, {
  DEBOUNCE_FILTERING_DELAY,
  RESPONSE_PAGE_SIZE,
} from '../../__integ__/page-objects/async-dropdown-page';
import createWrapper from '../../../lib/components/test-utils/selectors';

const select = createWrapper().findSelect();

const SCROLL_PAGE_HEIGHT = 550;

function setup(virtualScrolling: boolean, testFn: (page: AsyncDropdownComponentPage) => Promise<void>) {
  return useBrowser(async browser => {
    const page = new AsyncDropdownComponentPage(browser, select);
    await page.setWindowSize({ width: 950, height: 300 });
    // TODO: Remove VR flag once AWSUI-18701 is fixed
    await browser.url('/#/light/select/select.test.async?visualRefresh=false');
    await page.waitForVisible(select.findTrigger().toSelector());
    if (virtualScrolling) {
      await page.enableVirtualScrolling();
    }
    await page.click(select.findTrigger().toSelector());
    await testFn(page);
  });
}

test(
  'should request data when dropdown opens',
  setup(false, async page => {
    await expect(page.getOptionsCount()).resolves.toEqual(0);
    await page.assertStatusText('Fetching items');
    await expect(page.getLatestRequestParams()).resolves.toEqual({ filteringText: '', pageNumber: 0 });
    await page.respondWith(0, true);
    await expect(page.getOptionsCount()).resolves.toEqual(RESPONSE_PAGE_SIZE);
    await page.assertStatusText(null);
  })
);

test(
  'should request more items on scroll',
  setup(false, async page => {
    await page.respondWith(0, true);
    await page.scrollDropdown(SCROLL_PAGE_HEIGHT);
    await expect(page.getOptionsCount()).resolves.toEqual(RESPONSE_PAGE_SIZE);
    await page.assertStatusText('Fetching items');
    await expect(page.getLatestRequestParams()).resolves.toEqual({ filteringText: '', pageNumber: 1 });
    await page.respondWith(RESPONSE_PAGE_SIZE, true);
    await expect(page.getOptionsCount()).resolves.toEqual(2 * RESPONSE_PAGE_SIZE);
    await page.assertStatusText(null);
    await expect(page.getDropdownScrollPosition()).resolves.toEqual(SCROLL_PAGE_HEIGHT);
  })
);

test(
  'should render error state and retry on click',
  setup(false, async page => {
    await page.reject();
    await page.assertStatusText('Error fetching results. Retry');
    await page.waitForVisible(select.findErrorRecoveryButton().toSelector());
    await page.click(select.findErrorRecoveryButton().toSelector());
    await expect(page.getLatestRequestParams()).resolves.toEqual({ filteringText: '', pageNumber: 0 });
    await page.respondWith(RESPONSE_PAGE_SIZE, true);
    await expect(page.getOptionsCount()).resolves.toEqual(RESPONSE_PAGE_SIZE);
    await page.assertStatusText(null);
  })
);

test(
  'should render error state when next page request failed',
  setup(false, async page => {
    await page.respondWith(0, true);
    await page.scrollDropdown(SCROLL_PAGE_HEIGHT);
    await page.reject();
    await page.assertStatusText('Error fetching results. Retry');
    await expect(page.getOptionsCount()).resolves.toEqual(RESPONSE_PAGE_SIZE);
  })
);

test(
  'should clear the previous results when filtering',
  setup(false, async page => {
    await page.respondWith(0, true);
    await page.setValue(select.findFilteringInput()!.findNativeInput().toSelector(), 'test');
    await page.pause(DEBOUNCE_FILTERING_DELAY);
    await expect(page.getLatestRequestParams()).resolves.toEqual({ filteringText: 'test', pageNumber: 0 });
    await expect(page.getOptionsCount()).resolves.toEqual(0);
  })
);

test(
  'should display finished message when pagination ends',
  setup(false, async page => {
    await page.respondWith(0, false);
    await page.assertStatusText('End of all results');
    await expect(page.getOptionsCount()).resolves.toEqual(RESPONSE_PAGE_SIZE);
  })
);

describe.each([true, false])('Async select scrolling (with virtualScrolling=%s)', (virtualScrolling: boolean) => {
  test(
    'scroll position does not change, when a new batch of items arrives',
    setup(virtualScrolling, async page => {
      await page.respondWith(0, true);
      await page.scrollDropdown(SCROLL_PAGE_HEIGHT);
      const scrollPosition = await page.getDropdownScrollPosition();
      await page.respondWith(20, true);
      const newScrollPosition = await page.getDropdownScrollPosition();
      expect(newScrollPosition).toEqual(scrollPosition);
    })
  );
  test(
    'the bottom of the dropdown lines up with the highlighted option, when going down the list',
    setup(virtualScrolling, async page => {
      await page.respondWith(0, true);
      await page.keys(['ArrowDown', 'ArrowDown', 'ArrowDown']);
      const { bottom: optionBottom } = await page.getHighlightedPosition();
      const { bottom: dropdownBottom } = await page.getDropdownPosition();
      // a small give for borders and negative margins
      expect(Math.abs(optionBottom - dropdownBottom)).toBeLessThan(3);
    })
  );
  test(
    'the top of the dropdown lines up with the highlighted option, when going up the list',
    setup(virtualScrolling, async page => {
      await page.respondWith(0, true);
      await page.keys(['ArrowDown', 'ArrowDown', 'ArrowDown']);
      await page.keys(['ArrowUp', 'ArrowUp']);
      const { top: optionTop } = await page.getHighlightedPosition();
      const { top: dropdownTop } = await page.getDropdownPosition();
      // a small give for borders
      expect(Math.abs(optionTop - dropdownTop)).toBeLessThan(2);
    })
  );
});
