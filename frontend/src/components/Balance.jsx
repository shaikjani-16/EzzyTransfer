import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
export const Balance = () => {
  const [value, useValue] = useState(0);
  // useEffect(async () => {
  //   const res = await axios.get("http://localhost:8000/api/v1/account/balance");
  //   try {
  //     if (res.data.status === 200) {
  //       useValue(res.data.balance);
  //       toast.success("fetched balance");
  //     } else {
  //       toast.error(res.data.message);
  //       toast.error(res.data.status);
  //     }
  //   } catch (e) {
  //     toast.error(e.message || e);
  //   }
  // }, []);
  return (
    <div className="flex">
      <div className="font-bold text-lg">Your balance</div>
      <div className="font-semibold ml-4 text-lg">Rs {value}</div>
    </div>
  );
};
