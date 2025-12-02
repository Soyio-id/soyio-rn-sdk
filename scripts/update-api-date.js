#!/usr/bin/env node
/**
 * Syncs the hardcoded API date sent in FaceTec headers across platforms.
 * It replaces any ISO date (YYYY-MM-DD) in the known files with today's date.
 */

const fs = require('fs');
const path = require('path');

const today = new Date().toISOString().split('T')[0];
const root = path.resolve(__dirname, '..');
const targets = [
  'src/utils/apiDate.ts',
  'android/src/main/java/com/soyio/soyiorndk/ApiDate.kt',
  'ios/ApiDate.swift',
];

let updates = 0;

targets.forEach((relative) => {
  const file = path.join(root, relative);
  const original = fs.readFileSync(file, 'utf8');
  const next = original.replace(/\d{4}-\d{2}-\d{2}/g, today);

  if (original === next) {
    console.warn(`[update-api-date] No date replaced in ${relative}`);
    return;
  }

  fs.writeFileSync(file, next, 'utf8');
  updates += 1;
  console.log(`[update-api-date] Updated ${relative} to ${today}`);
});

if (updates === 0) {
  console.warn('[update-api-date] No files were updated.');
}
