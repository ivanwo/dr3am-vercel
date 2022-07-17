import { LogLevel } from "@azure/msal-browser";

//
// auth data still wrong, need to do more research
//
export const msalConfig = {
  idToken : "",
  currentUser: {signupcompleted:false},
  auth: {
    clientId: "05ce2ef8-cf62-4442-a178-d8cef47405b0",
    // authority: "https://dr3amspace.b2clogin.com/tfp/1234293e-414e-40f2-af88-bc1ed993f133",
    // authority: "https://dr3amspace.b2clogin.com/dr3amspace.onmicrosoft.com/b2c_1_email_and_google",
    authority: "https://dr3amspace.b2clogin.com/dr3amspace.onmicrosoft.com/B2C_1_google_email",
    // authority: "https://login.microsoftonline.com/common",
    // knownAuthorities: ["https://dr3amspace.b2clogin.com/dr3amspace.onmicrosoft.com/b2c_1_email_and_google"],
    knownAuthorities: ["https://dr3amspace.b2clogin.com/dr3amspace.onmicrosoft.com/B2C_1_google_email"],
    // knownAuthorities: ["https://login.microsoftonline.com/common"],
    redirectUri: "/",
    postLogoutRedirectUri: "/",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: [],
};
