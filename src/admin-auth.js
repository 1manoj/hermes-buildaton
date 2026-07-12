import { randomBytes,scryptSync,timingSafeEqual,createHmac } from "node:crypto";
const b64=x=>Buffer.from(x).toString("base64url"),unb64=x=>Buffer.from(x,"base64url");
export function hashPassword(password,salt=randomBytes(16).toString("hex")){return `scrypt$${salt}$${scryptSync(password,salt,64).toString("hex")}`;}
export function verifyPassword(password,stored){try{const [kind,salt,expected]=String(stored).split("$");if(kind!=="scrypt")return false;const a=scryptSync(password,salt,64),b=Buffer.from(expected,"hex");return a.length===b.length&&timingSafeEqual(a,b);}catch{return false;}}
export function createAdminSession(username,secret,now=Date.now(),ttl=8*60*60*1000){const payload=b64(JSON.stringify({username,exp:now+ttl,nonce:randomBytes(8).toString("hex")})),sig=createHmac("sha256",secret).update(payload).digest("base64url");return `${payload}.${sig}`;}
export function verifyAdminSession(token,secret,now=Date.now()){try{const [payload,sig]=String(token).split("."),expected=createHmac("sha256",secret).update(payload).digest();if(!sig||!timingSafeEqual(expected,unb64(sig)))return null;const data=JSON.parse(unb64(payload));return data.exp>now?data:null;}catch{return null;}}
export const bearer=req=>String(req.headers.authorization||"").replace(/^Bearer\s+/i,"");
