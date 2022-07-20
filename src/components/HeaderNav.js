import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const HeaderNav = ({ instance, accounts }) => {
    let location = useLocation();
    return (
      <h1 id="headernav">
        <Link to="/" className={location.pathname == "/" ? "activelogo" : ""}>
          DR3AM.SPACE
        </Link>
      </h1>
    );
  };

  export default HeaderNav;