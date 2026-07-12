import { hashUserPassword,verifyUserPassword } from "./user-auth.js";

export function validateNewPassword(password){
  const value=String(password||"");
  if(value.length<8)throw new Error("New password must be at least 8 characters");
  if(value.length>128)throw new Error("New password must be 128 characters or fewer");
  return value;
}

export function validatePasswordChange({currentPassword,newPassword,storedHash}){
  if(!storedHash)throw new Error("This legacy account needs a password reset before changing its password");
  if(!verifyUserPassword(currentPassword,storedHash))throw new Error("Current password is incorrect");
  const next=validateNewPassword(newPassword);
  if(verifyUserPassword(next,storedHash))throw new Error("New password must be different from the current password");
  return hashUserPassword(next);
}
