export function contactRecipient(email) {
  const value = email?.trim();
  if (!value || !/^[a-z0-9.!#$%&'*+/=_{}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(value)) return "";
  return /@(?:example\.(?:com|net|org)|kagisogabonamong\.com)$/i.test(value) && (value.toLowerCase() === "hello@kagisogabonamong.com" || /@example\./i.test(value)) ? "" : value;
}

export function enquiryUrl(email, fields, service) {
  const body = [service && "Enquiry type: " + service, "Name: " + fields.get("name"), "Email: " + fields.get("email"), "", "Message:", fields.get("message")].filter((line) => line !== false && line != null).join("\r\n").trimStart();
  return "mailto:" + encodeURIComponent(email).replace("%40", "@") + "?subject=" + encodeURIComponent(fields.get("subject")) + "&body=" + encodeURIComponent(body);
}
