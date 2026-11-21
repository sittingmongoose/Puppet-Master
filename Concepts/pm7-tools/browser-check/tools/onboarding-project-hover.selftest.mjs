import assert from 'node:assert/strict';
import * as check from '../checks/onboarding-resume-look.check.mjs';

const path = '~/Documents/Recipe shelf';
const label = 'Recipe shelf';
const row = { attrs: { 'data-project-name': label, 'data-project-path': path } };
const hover = (detail) => ({ label, detail: detail + '. Switch project: Ctrl+Shift+P' });
assert.equal(check.projectHoverMatches({ ...row, hover: hover(path) }, ''), true);
assert.equal(check.projectHoverMatches(row, ''), false, 'the menu row alone cannot prove the title-bar hover');
assert.equal(check.projectHoverMatches({ ...row, hover: hover(path) }, 'main'), false, 'the online hover needs its branch');
assert.equal(check.projectHoverMatches({ ...row, hover: hover(path + ' on maintenance') }, 'main'), false, 'a branch prefix is insufficient');
assert.equal(check.projectHoverMatches({ ...row, hover: hover(path + ' on main · Git') }, 'main'), true);
console.log('PASS title-bar hover must have the project name, path and exact online branch');
