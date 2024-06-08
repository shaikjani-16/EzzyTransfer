import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const Balance = () => {
  const [value, setValue] = useState(0);
  const [fetched, setFetched] = useState(false); // Flag to track whether the request has been made

  useEffect(() => {
    const fetchBalance = async () => {
      if (!fetched) {
        try {
          const res = await axios.get(
            "http://localhost:8000/api/v1/account/balance",
            { withCredentials: true }
          );

          if (res.data.status === 200) {
            setValue(res.data.balance);
            toast.success("Fetched balance");
          } else {
            toast.error(res.data.message);
            toast.error(res.data.status);
          }
        } catch (e) {
          toast.error(e.message || e);
        } finally {
          setFetched(true); // Set the flag to true after the request is completed
        }
      }
    };

    fetchBalance();
  }, [fetched]); // Include fetched in the dependencies array

  return (
    <div className="flex">
      <div className="font-bold text-lg">Your balance</div>
      <div className="font-semibold ml-4 text-lg">Rs {value}</div>
    </div>
  );
};
