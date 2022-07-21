import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { Link, useLocation } from "react-router-dom";
import { loginRequest, msalConfig } from "../../settings/msalConfig";

const FooterNav = ({ setModalVisible }) => {
  let { instance, accounts } = useMsal();

  let toggleModal = (_) => {
    // msalConfig.modal.title = msalConfig.modal.title + " wef ef ";
    setModalVisible(true);
  };

  return (
    <>
      {msalConfig.currentUser.signupcompleted ? (
        <nav id="navfooter">
          <Link
            to="about"
            className={
              "footerlink" +
              (location.pathname == "/about" ? " activelink" : "")
            }
          >
            about
          </Link>
          <Link
            to="me"
            className={
              "footerlink" + (location.pathname == "/me" ? " activelink" : "")
            }
          >
            {msalConfig.currentUser.username}'s dreams
          </Link>
          <Link
            to="new"
            className={
              "footerlink" + (location.pathname == "/new" ? " activelink" : "")
            }
          >
            new dream
          </Link>
          <Link
            to="feed"
            className={
              "footerlink" + (location.pathname == "/feed" ? " activelink" : "")
            }
          >
            feed
          </Link>
          <a
            className="footerlink"
            onClick={(_) =>
              instance.logoutRedirect({ postLogoutRedirectUri: "/" })
            } // let user pick their own logout redirect? lmao
          >
            log out
          </a>
          {/* <a className="footerlink" onClick={(_) => toggleModal()}>
              modal
            </a> */}
        </nav>
      ) : (
        <></>
      )}
    </>
  );
};

export default FooterNav;
