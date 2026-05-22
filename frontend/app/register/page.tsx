"use client";

import { useState } from "react";

import axios from "axios";

export default function RegisterPage() {
  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        {
          username,
          email,
          password,
        }
      );

      window.location.href =
        "/login";
    } catch (error: any) {
      alert(
        error?.response?.data
          ?.error ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center text-white">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 w-[420px]">
        <h1 className="text-5xl font-bold text-purple-500 mb-3">
          OneSpace
        </h1>

        <p className="text-zinc-400 mb-10">
          Create your account
        </p>

        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-5"
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            className="bg-black border border-zinc-800 rounded-xl px-5 py-4 outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="bg-black border border-zinc-800 rounded-xl px-5 py-4 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="bg-black border border-zinc-800 rounded-xl px-5 py-4 outline-none"
          />

          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-600 rounded-xl py-4 font-bold"
          >
            Register
          </button>
        </form>

        <p className="text-zinc-500 mt-8 text-center">
          Already have an account?
        </p>

        <button
          onClick={() =>
            (window.location.href =
              "/login")
          }
          className="w-full mt-3 border border-zinc-700 rounded-xl py-3 hover:bg-zinc-900"
        >
          Login
        </button>
      </div>
    </div>
  );
}
