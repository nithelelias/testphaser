const API =
  "https://script.google.com/macros/s/AKfycbx1dVpgzZh8bPLAyv1eHP-fv8AqF9oBiZEUIDo7If79EPk6rQMmdPjQ5stinjpGSx9w/exec";
const connect = { get, post };

function parseJsonToQueryString(params) {
  if (typeof params === "string") {
    return params;
  }
  return new URLSearchParams(params).toString();
}

function parseJsonRaw(raw) {
  try {
    return JSON.parse(ra);
  } catch (e) {
    return raw;
  }
}
async function get(params) {
  const r = await fetch(API + "?" + parseJsonToQueryString(params));
  return parseJsonRaw(r.text());
}
async function post(params) {
  const r = await fetch(API, {
    method: "POST",
    url: API,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  return parseJsonRaw(r.text());
}
export default connect;