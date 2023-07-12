// import type { Cookies } from '@sveltejs/kit';


import { nanoid } from 'nanoid';
// import { RequestEvent } from '@sveltejs/kit';

//TODO can i use native svelte methods like cookie and it still be successfully packaged?
export async function getGitHubIdentity(client_id: string, cookieSetter?: any, maxAge?: number,): Promise<any> {
  const state = nanoid();

  //Cookie non native method
  const cookieHeader = `github_oauth_state=${state}; HttpOnly; Max-Age=3600; Path=/`;

  //Cookie native method
  // Cookies.set("test_github_oauth_state", state, {
  //   httpOnly: true,
  //   secure: !dev, // disable when using localhost
  //   maxAge: 60 * 60, // 1 hour expiry,
  //   path: "/"
  // });

  //Possible config for Cookie
  // cookieSetter("github_oauth_state", state, {
  //   httpOnly: true,
  //   maxAge: maxAge ? maxAge : 60 * 60, // 1 hour expiry
  //   path: "/"
  // });

  const authorizationUrlSearchParams = await new URLSearchParams({
    client_id: client_id,
    state,
    // params: { scope: "read:user user:email" },
  });
  const authorizationUrl = `https://github.com/login/oauth/authorize?${authorizationUrlSearchParams}`;

  const headers = new Headers();
  headers.append('Set-Cookie', cookieHeader);
  headers.append('Location', authorizationUrl);
  return headers
  // return {
  //   status: 302,
  //   headers: {
  //     Location: authorizationUrl
  //   }
  // };
}
export async function getGitHubValidation(client_id: string, client_secret: string, event) {
  const storedState = event.cookies.get("github_oauth_state");
  const state = event.url.searchParams.get("state");

  if (!storedState || !state || storedState !== state) {
    return new Response(null, {
      status: 400
    });
  }
  const code = event.url.searchParams.get("code");
  if (!code) {
    return new Response(null, {
      status: 400
    });
  }
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: client_id,
      client_secret: client_secret,
      code
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    console.log('Response was NOT okay');
    return new Response(null, {
      status: 400
    });
  }
  const result = await response.json() as { access_token: string }
  const accessToken = result.access_token

  // do stuff with access token
  // return some response

  return accessToken
  //try to just return here with a redirect
  // return new Response('Redirect', {status: 303, headers: { Location: '/secret' }});
}




