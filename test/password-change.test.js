import test from "node:test";
import assert from "node:assert/strict";
import { validatePasswordChange } from "../src/password-change.js";
import { hashUserPassword } from "../src/user-auth.js";

test("password change requires the correct current password", () => {
  const stored=hashUserPassword("Current@123");
  assert.throws(()=>validatePasswordChange({currentPassword:"wrong",newPassword:"Newpass@123",storedHash:stored}),/Current password is incorrect/);
});

test("password change enforces a useful minimum length", () => {
  const stored=hashUserPassword("Current@123");
  assert.throws(()=>validatePasswordChange({currentPassword:"Current@123",newPassword:"short",storedHash:stored}),/at least 8/);
});

test("password change returns a new verifiable hash", () => {
  const stored=hashUserPassword("Current@123");
  const next=validatePasswordChange({currentPassword:"Current@123",newPassword:"Newpass@123",storedHash:stored});
  assert.notEqual(next,stored);
  assert.match(next,/^scrypt\$/);
});

test("legacy account without a password cannot silently change one", () => {
  assert.throws(()=>validatePasswordChange({currentPassword:"anything",newPassword:"Newpass@123",storedHash:""}),/password reset/i);
});
