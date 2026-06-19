const { Given, When, Then, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const assert = require('assert');

let browser;
let page;

Before(async () => {
  browser = await chromium.launch({
    headless: false
  });

  page = await browser.newPage();
});

After(async () => {
  await browser.close();
});

Given('Pengguna membuka halaman login', async () => {
  await page.goto('http://localhost:5173/login');
});

When('Pengguna memasukkan email {string}', async (email) => {
  await page.locator('input[type="email"]').fill(email);
});

When('Pengguna memasukkan kata sandi {string}', async (password) => {
  await page.locator('input[type="password"]').fill(password);
});

When('Pengguna menekan tombol {string}', async (buttonText) => {

  page.once('dialog', async dialog => {
    await dialog.accept();
  });

  await page.getByRole('button', { name: buttonText }).click();
});

Then('Pengguna harus dialihkan ke halaman {string}', async (expectedPath) => {

  await page.waitForURL(`**${expectedPath}`);

  const currentUrl = page.url();

  assert(
    currentUrl.includes(expectedPath),
    `Harusnya ke ${expectedPath} tapi sekarang ${currentUrl}`
  );
});

Then('Token autentikasi harus tersimpan di localStorage', async () => {

  const token = await page.evaluate(() =>
    localStorage.getItem('token')
  );

  assert(token !== null, 'Token tidak ditemukan');
});

Then('Pengguna harus melihat pesan error {string}', async (expectedErrorMessage) => {

  await page.waitForTimeout(1000);

  const bodyText = await page.locator('body').innerText();

  assert(
    bodyText.includes(expectedErrorMessage),
    `Pesan "${expectedErrorMessage}" tidak ditemukan`
  );
});