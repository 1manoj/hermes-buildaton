import test from "node:test";import assert from "node:assert/strict";
import { hashPassword,verifyPassword,createAdminSession,verifyAdminSession } from "../src/admin-auth.js";
test("password hash verifies correct password and rejects wrong password",()=>{const hash=hashPassword("Strong pass 42!");assert.equal(verifyPassword("Strong pass 42!",hash),true);assert.equal(verifyPassword("wrong",hash),false);assert.notEqual(hash,"Strong pass 42!")});
test("signed admin session expires and rejects tampering",()=>{const token=createAdminSession("newsadmin","secret",1000,5000);assert.equal(verifyAdminSession(token,"secret",2000)?.username,"newsadmin");assert.equal(verifyAdminSession(token+"x","secret",2000),null);assert.equal(verifyAdminSession(token,"secret",7000),null)});
