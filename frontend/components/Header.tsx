"use client";

export default function Header() {

  const handleLogout = () => {

    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <div className="
      flex
      justify-between
      items-center
      mb-10
    ">

      <div>

        <h1 className="
          text-5xl
          font-bold
          text-violet-500
        ">
          Dashboard
        </h1>

        <p className="
          text-zinc-400
          mt-2
        ">
          Welcome to OneSpace.
        </p>

      </div>

      <button
        onClick={handleLogout}
        className="
          bg-red-600
          hover:bg-red-700
          transition
          px-6
          py-3
          rounded-xl
          font-semibold
        "
      >
        Logout
      </button>

    </div>
  );
}
