import { randomUUID } from "node:crypto";
import { requestError, rows } from "./database.js";

const types = {
  "application/pdf": ["pdf", (bytes)=>bytes.subarray(0,5).toString() === "%PDF-" && bytes.subarray(-1024).includes("%%EOF")],
  "image/png": ["png", (bytes)=>bytes.subarray(0,8).equals(Buffer.from("89504e470d0a1a0a","hex"))],
  "image/jpeg": ["jpg",(bytes)=>bytes.subarray(0,3).equals(Buffer.from("ffd8ff","hex"))],
  "image/webp": ["webp",(bytes)=>bytes.subarray(0,4).toString() === "RIFF" && bytes.subarray(8,12).toString() === "WEBP"],
};

export function checkedMedia({type,data,alt,name}) {
  const bytes = Buffer.isBuffer(data) ? data :
    typeof data === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(data) ? Buffer.from(data,"base64") : Buffer.alloc(0);
  if (!Object.hasOwn(types,type) || bytes.length < 12 || bytes.length > 3_000_000 || !types[type][1](bytes))
    throw requestError(400,"Choose a valid PDF, PNG, JPEG or WebP under 3 MB.");
  if (typeof name !== "string" || !name.trim() || name.length > 180 || typeof alt !== "string" || alt.length > 300)
    throw requestError(400,"Check the file name and alternative text.");
  return {bytes,type,alt,name,extension:types[type][0]};
}

export async function uploadMedia(input, actor) {
  const {bytes,type,alt,name,extension} = checkedMedia(input);
  const base = process.env.SUPABASE_URL.replace(/\/$/,"");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const path = randomUUID() + "." + extension;
  const response = await fetch(base+"/storage/v1/object/mystic-media/"+path,{
    method:"POST", redirect:"manual", headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":type},body:bytes,signal:AbortSignal.timeout(15000),
  });
  if (!response.ok) throw requestError(503,"The upload could not be saved.");
  const url = "/media/"+path;
  try {
    const [item] = await rows("mystic_media",{method:"POST",prefer:"return=representation",body:{path,url,type,alt,name,actor}});
    return item;
  } catch (error) {
    await fetch(base+"/storage/v1/object/mystic-media",{
      method:"DELETE",redirect:"manual",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({prefixes:[path]}),signal:AbortSignal.timeout(10000),
    }).catch(()=>{});
    throw error;
  }
}
import { Buffer } from "node:buffer";
