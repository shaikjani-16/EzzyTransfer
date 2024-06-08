import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSetRecoilState } from "recoil";
import { nameAtom } from "../store/atom";

const Signin = () => {
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  const setName = useSetRecoilState(nameAtom);
  return (
    <div className="w-full max-w-xs mx-auto mt-20">
      <form className="bg-white  rounded px-8 pt-6 pb-8 mb-4 shadow-lg">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="username"
          >
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            placeholder="Username"
            required
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="******************"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-red-500 text-xs italic">
            Please choose a password.
          </p>
        </div>
        <div className="flex items-center justify-center mb-3">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              try {
                const res = await axios.post(
                  "http://localhost:8000/api/v1/user/signin",
                  {
                    userName,
                    password,
                  }
                  // { withCredentials: true }
                );

                if (res.data.status === 200) {
                  toast.success(res.data.message);
                  setName(res.data.user?.firstName[0].toUpperCase());
                  // localStorage.setItem("token", res.data.token);
                  setCookie("accessToken", res.data.token, 1);
                  navigate("/");
                } else {
                  toast.error(res.data.message);
                }
              } catch (e) {
                toast.error(e.message || e);
              }
            }}
          >
            Sign In
          </button>
        </div>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup">
            <a
              href="#"
              className="font-medium text-primary-600 hover:underline dark:text-primary-500"
            >
              Signup here
            </a>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signin;
