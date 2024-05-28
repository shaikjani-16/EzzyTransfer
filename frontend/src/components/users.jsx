import { useState, useEffect } from "react";
import { Button } from "./button";
import { SendMoney } from "./sendMoney";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/user/getUsers?filter=" + search)
      .then((res) => {
        setUsers(res.data.user);
      });
  }, [search]);

  return (
    <>
      <div className="font-bold mt-6 text-lg">Users</div>
      <div className="my-2">
        <input
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          type="text"
          placeholder="Search users..."
          className="w-full px-2 py-1 border rounded border-slate-200"
        ></input>
      </div>
      <div>
        {users.map((user) => (
          <User user={user} key={user._id} />
        ))}
      </div>
    </>
  );
};

function User({ user }) {
  const navigate = useNavigate();
  return (
    <div className="flex justify-between">
      <div className="flex">
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          <div className="flex flex-col justify-center h-full text-xl">
            {user.firstName[0]}
          </div>
        </div>
        <div className="flex flex-col justify-center h-ful">
          <div>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center h-full ">
        <button
          className="bg-gray-500 rounded-lg text-md"
          onClick={() => {
            const url = `/send?id=${user._id}&name=${user.firstName}`;

            navigate(url);
          }}
        >
          Send Money
        </button>
      </div>
    </div>
  );
}
