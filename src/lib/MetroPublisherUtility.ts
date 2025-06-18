const MP_API_URL = process.env.MP_API_URL;
const MP_INSTANCE_ID = process.env.MP_INSTANCE_ID;
const MP_API_KEY = process.env.MP_API_KEY || "";
const MP_API_SECRET = process.env.MP_API_SECRET || "";
const MP_AUTH_PROVIDER = process.env.MP_AUTH_PROVIDER;

export const pauseTimeMs = 1000;
let access_token: string;

const encodeParams = (p: object) =>
    Object.entries(p)
        .map((kv) => kv.map(encodeURIComponent).join("="))
        .join("&");

type tokenData = {
    grant_type: string;
    api_key: string;
    api_secret: string;
};

export function makeUrlName(title: string, addTimestamp: boolean = false) {
    let urlname = title.trim();
    urlname = urlname.toLowerCase();
    urlname = urlname.replace(/ /gim, "_");
    if (addTimestamp) {
        const now = new Date().valueOf();
        urlname = `${urlname}-${now}`;
    }
    return urlname;
}

export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const fMonth = month < 10 ? "0" + month : month;
    const day = date.getDay();
    const fDay = day < 10 ? "0" + day : day;
    const hour = date.getHours();
    const fHour = hour < 10 ? "0" + hour : hour;
    const minute = date.getMinutes();
    const fMinute = minute < 10 ? "0" + minute : minute;
    const second = date.getSeconds();
    const fSecond = second < 10 ? "0" + second : second;
    return `${year}-${fMonth}-${fDay}T${fHour}:${fMinute}:${fSecond}`;
};

const getToken = async (data: tokenData) => {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };

    const encData = encodeParams(data);
    const result = await fetch(`${MP_AUTH_PROVIDER}/oauth/token`, {
        method: "POST",
        headers: headers,
        body: encData,
    });
    const response = await result.text();
    const json = JSON.parse(response);
    return json;
};

export const retryFetch = async (
    url: string,
    contentType: string,
    method: string,
    body: string | Buffer
) => {
    // we retry request s 5 times on retryable errors
    let attempt = 1;

    const fullUrl = `${MP_API_URL}/${MP_INSTANCE_ID}${url}`;
    const data = {
        grant_type: "client_credentials",
        api_key: MP_API_KEY,
        api_secret: MP_API_SECRET,
    };

    if (!access_token) {
        // we need to get a new access token
        const token = await getToken(data);
        access_token = token.access_token;
        console.log("Getting new access token");
    } else {
        console.log("Using existing access token");
    }

    while (attempt <= 5) {
        console.log("ATTEMPT", attempt, fullUrl, method);

        const auth_header = `bearer ${access_token}`;
        const headers = {
            Authorization: auth_header,
            "User-Agent": "metropublisher-agent/1.0",
            "Content-Type": contentType,
        };
        const result = await fetch(fullUrl, {
            method: method,
            headers: headers,
            body: body,
        });
        console.log(result, method, headers, body);
        if (result.status === 200) {
            return result;
        }
        if (result.status === 401) {
            // unauthorized so we need a new access token
            access_token = "";
        }
        // we only retry the request for unauthoriesed (401) or temporary unavailable (503)
        if ([401, 503].indexOf(result.status) === -1) {
            console.log("Not retriable result status.", result.status);
            throw new Error("Could not connect to the API.");
        }
        attempt += 1;
        // pause between API to avoid overloading the API
        await new Promise((resolve) => setTimeout(resolve, pauseTimeMs));
    }
    throw new Error("Too many unsuccessfull requests");
};
