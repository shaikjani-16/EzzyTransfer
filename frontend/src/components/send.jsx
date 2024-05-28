import React from "react";
import { useSearchParams } from "react-router-dom";

const Send = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const name = searchParams.get("name");

  return;
  <div className="flex">
    <label>Enter Amount</label>
    <input type="number" />
  </div>;
};

export default Send;
