import { LogLevel } from "@azure/msal-browser";

//
// auth data still wrong, need to do more research
//
export const msalConfig = {
  auth: {
    clientId: "5d0e2488-4981-4f1b-9849-bf737a46b428",
    // authority: "https://dr3amspace.b2clogin.com/tfp/1234293e-414e-40f2-af88-bc1ed993f133",
    authority: "https://login.microsoftonline.com/common",
    knownAuthorities: ["https://login.microsoftonline.com/common"],
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
