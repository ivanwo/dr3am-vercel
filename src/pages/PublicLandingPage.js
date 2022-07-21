import React from 'react';
import { loginRequest } from '../../settings/msalConfig';

const PublicLandingPage = ({ instance, accounts }) => {
    return (
      <div>
        <h2>hot dreams in your area!!</h2>
        <p>
          track your dreams, view free range local dreams, view collective
          unconscious trends!
        </p>
        <p>
          dr3am.space is a platform that will facilitate these and other
          activities.
        </p>
        <div className="random dream">
          <h3>random dream</h3>
          <p>think about how to implement this without opening the api...</p>
        </div>
        <button
          onClick={(_) => {
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            )
              ? instance.loginRedirect(loginRequest)
              : instance.loginPopup(loginRequest);
          }}
          className="loginbutton"
        >
          log in/ sign up
        </button>
      </div>
    );
  };
  export default PublicLandingPage;