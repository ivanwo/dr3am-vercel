import React from "react";
import { Link, useLocation } from "react-router-dom";

let Dream = ({ dream }) => {
  return (
    <div className="dreamobject">
      <div className="dreamheader">
        <span className="dreammood">{dream.mood}</span>
        {/* <span className="dreamtitle">{dream.dreamtitle}</span> */}
        <Link to={"../dream/" + dream.rowKey} className="dreamtitle">
          {dream.dreamtitle}
        </Link>
      </div>
      <div className="dreamsubheader">
        <Link to={"../user/" + dream.user}>
          @{dream.user} <span className="zodiacsign">{dream.userzodiac}</span>
        </Link>
        <span>{dream.timestamp.split("T")[0]}</span>
        <span>{dream.location}</span>
      </div>
      <div className="dreambody">
        <span>{dream.dreamcontent}</span>
      </div>
      <div className="dreamfooter">
        <span>reply</span>
        <span>react</span>
        <span>report</span>
        <span>redo</span>
        <span>remove</span>
      </div>
    </div>
  );
};

export default Dream;
