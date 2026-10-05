// Builds ../desktop.html from desktop.src.html.
// The desktop page reuses the mobile prototype's design assets so both versions stay identical:
//   const A      – image assets
//   const ICON   – bottom-nav / card icons
//   const CPICON – campaign-page icons
//   const MICON  – icons lifted from the mobile markup (header, settings rows, profile links, submit page)
// Usage: node desktop/build.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mobile = fs.readFileSync(path.join(root, 'prototype (1).html'), 'utf8');
const src = fs.readFileSync(path.join(__dirname, 'desktop.src.html'), 'utf8');

function block(start) {
  const i = mobile.indexOf(start);
  if (i < 0) throw new Error(`"${start}" not found in the mobile prototype`);
  const end = mobile.indexOf('\n};', i);
  if (end < 0) throw new Error(`No closing "};" for "${start}"`);
  return mobile.slice(i, end + 3);
}

// First <svg>…</svg> that appears after `marker` (optionally searching from `from`).
function svgAfter(marker, from = 0) {
  const i = mobile.indexOf(marker, from);
  if (i < 0) throw new Error(`Icon marker "${marker}" not found in the mobile prototype`);
  const s = mobile.indexOf('<svg', i);
  const e = mobile.indexOf('</svg>', s);
  return mobile.slice(s, e + 6).replace(/\s*\n\s*/g, ' ');
}
// Settings rows: <span class="set-ic"><svg/></span> <span class="set-lbl">Label</span>
function settingsIcon(label) {
  const i = mobile.indexOf(`>${label}</span>`, mobile.indexOf('id="settings"'));
  if (i < 0) throw new Error(`Settings row "${label}" not found`);
  const s = mobile.lastIndexOf('<svg', i);
  return mobile.slice(s, mobile.indexOf('</svg>', s) + 6).replace(/\s*\n\s*/g, ' ');
}

const home = mobile.indexOf('id="home"');
const MICON = {
  menu: svgAfter('class="icon" data-nav="myprofile"', home),
  search: svgAfter('<div class="right">', home),
  bell: svgAfter('data-nav="notifications"', home),
  back: svgAfter('class="pf-back"'),
  handleChev: svgAfter('<div class="pf-handle">'),
  shield: svgAfter('class="shield"'),
  plus: svgAfter('class="pf-addhandle"'),
  settings: svgAfter('<a data-nav="settings"><span class="ic">'),
  privacy: svgAfter('privacy-policy" target="_blank" rel="noopener"><span class="ic">'),
  logout: svgAfter('<a class="logout" data-overlay="logout"><span class="ic">'),
  calendar: svgAfter('class="day"'),
  upload: svgAfter('class="sc-uploadicon"'),
  check: svgAfter('class="sc-check"'),
  email: settingsIcon('Email'),
  phone: settingsIcon('Phone number'),
  password: settingsIcon('Password'),
  bank: settingsIcon('Payout &amp; bank details'),
  tax: settingsIcon('Tax information'),
  push: settingsIcon('Push notifications'),
  emailUpdates: settingsIcon('Email updates'),
  alerts: settingsIcon('Campaign &amp; payout alerts'),
  language: settingsIcon('Language'),
  blocked: settingsIcon('Blocked accounts'),
  twofa: settingsIcon('Two-factor authentication'),
  policy: settingsIcon('Privacy policy'),
  terms: settingsIcon('Terms of service'),
  help: settingsIcon('Help center'),
  contact: settingsIcon('Contact support'),
  about: settingsIcon('About'),
  logoutRow: settingsIcon('Log out'),
  delete: settingsIcon('Delete account'),
  rowChev: svgAfter('class="set-chev"', mobile.indexOf('id="settings"')),
  sheetLogout: svgAfter('class="cf-ic neutral"'),
  sheetWarn: svgAfter('class="cf-ic warn"'),
};

const out = src
  .replace('/*@ASSETS@*/', () => block('const A = {'))
  .replace('/*@ICON@*/', () => block('const ICON = {'))
  .replace('/*@CPICON@*/', () => block('const CPICON={'))
  .replace('/*@MICON@*/', () => `const MICON = ${JSON.stringify(MICON, null, 1)};`);

fs.writeFileSync(path.join(root, 'desktop.html'), out);
console.log(`desktop.html written (${(out.length / 1024).toFixed(0)} KB)`);
