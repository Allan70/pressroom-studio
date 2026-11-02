import assert from 'node:assert/strict';
import {projectName,projectFilename} from './dist/project-file.js';
assert.equal(projectName('  Team launch  '),'Team launch');assert.equal(projectName('  '),'Untitled project');assert.equal(projectName(null),'Untitled project');assert.equal(projectName('a'.repeat(100)).length,80);assert.equal(projectFilename('Team / launch'),'Team - launch.pressroom.json');assert.equal(projectFilename('CON'),'Project CON.pressroom.json');assert.equal(projectFilename(' name. '),'name.pressroom.json');assert.equal(projectName('Café print'),'Café print');
console.log('Project names verified: readable labels, defaults, length bounds and portable local filenames.');
