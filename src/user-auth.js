import { createHmac,timingSafeEqual,randomBytes,scryptSync } from "node:crypto";
const encode=value=>Buffer.from(JSON.stringify(value)).toString("base64url");
const sign=(value,secret)=>createHmac("sha256",secret).update(value).digest("base64url");
export function createUserSession(userId,secret,ttlSeconds=60*60*24*30){const payload=encode({sub:String(userId),exp:Date.now()+ttlSeconds*1000});return `${payload}.${sign(payload,secret)}`;}
export function verifyUserSession(token,secret){try{if(!token||!secret)return null;const [payload,signature]=token.split("."),expected=sign(payload,secret);if(!signature||signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null;const data=JSON.parse(Buffer.from(payload,"base64url"));return data.exp>Date.now()&&data.sub?data:null;}catch{return null;}}
export const requestToken=req=>String(req.headers.authorization||"").replace(/^Bearer\s+/i,"").trim();
export const userFromRequest=(req,secret)=>verifyUserSession(requestToken(req),secret)?.sub||null;
export function hashUserPassword(password){const salt=randomBytes(16).toString("base64url"),hash=scryptSync(String(password),salt,64).toString("base64url");return `scrypt$${salt}$${hash}`;}
export function verifyUserPassword(password,stored){try{const [algorithm,salt,hash]=String(stored||"").split("$");if(algorithm!=="scrypt"||!salt||!hash)return false;const actual=scryptSync(String(password),salt,64),expected=Buffer.from(hash,"base64url");return actual.length===expected.length&&timingSafeEqual(actual,expected);}catch{return false;}}
