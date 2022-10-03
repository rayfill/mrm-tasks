import browser from 'webextension-polyfill';

browser.pageAction.onClicked.addListener(async (tab) => {
  try {
    console.log('tab id', tab.id);
  } catch (e) {
  }
});

browser.tabs.onActivated.addListener((activeInfo) => {
  browser.pageAction.show(activeInfo.tabId);
});
