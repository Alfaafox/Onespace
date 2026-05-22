"use client";

import {
  Bell,
  ChevronDown,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import { useState } from "react";

interface Props {
  onCreateWorkspace:
    () => void;

  onCreatePage:
    () => void;
}

export default function Topbar({
  onCreateWorkspace,
  onCreatePage,
}: Props) {

  const [open, setOpen] =
    useState(false);

  return (

    <div
      className="
        h-[78px]
        border-b
        border-zinc-800
        bg-[#131722]
        px-8
        flex
        items-center
        justify-between
      "
    >

      {/* LEFT EMPTY SPACE */}

      <div className="w-[120px]" />





      {/* CENTER SEARCH */}

      <div
        className="
          flex-1
          flex
          justify-center
        "
      >

        <div
          className="
            relative
            w-[520px]
          "
        >

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            type="text"
            placeholder="
              Search spaces, pages, content...
            "
            className="
              w-full
              h-[52px]
              bg-[#0b0f19]
              border
              border-zinc-700
              rounded-2xl
              pl-12
              pr-5
              text-white
              placeholder:text-zinc-500
              outline-none
              focus:border-violet-500
              transition-all
            "
          />

        </div>

      </div>





      {/* RIGHT ACTIONS */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {/* CREATE */}

        <div className="relative">

          <button
            onClick={() =>
              setOpen(!open)
            }
            className="
              h-[50px]
              px-5
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              to-purple-500
              text-white
              font-semibold
              flex
              items-center
              gap-2
              shadow-lg
              shadow-violet-500/20
              hover:scale-[1.02]
              transition-all
            "
          >

            <Plus size={18} />

            Create

            <ChevronDown size={15} />

          </button>





          {open && (

            <div
              className="
                absolute
                right-0
                top-[60px]
                w-[230px]
                bg-[#161b27]
                border
                border-zinc-700
                rounded-2xl
                shadow-2xl
                overflow-hidden
                z-50
              "
            >

              <button
                onClick={() => {

                  onCreateWorkspace();

                  setOpen(false);

                }}
                className="
                  w-full
                  text-left
                  px-5
                  py-4
                  text-white
                  hover:bg-[#202638]
                  transition
                  border-b
                  border-zinc-700
                "
              >

                Create Space

              </button>





              <button
                onClick={() => {

                  onCreatePage();

                  setOpen(false);

                }}
                className="
                  w-full
                  text-left
                  px-5
                  py-4
                  text-white
                  hover:bg-[#202638]
                  transition
                "
              >

                Create Page

              </button>

            </div>

          )}

        </div>





        {/* NOTIFICATIONS */}

        <button
          className="
            w-12
            h-12
            rounded-2xl
            bg-[#1b2130]
            border
            border-zinc-700
            flex
            items-center
            justify-center
            text-zinc-400
            hover:text-white
            hover:border-violet-500
            transition
          "
        >

          <Bell size={18} />

        </button>





        {/* SETTINGS */}

        <button
          className="
            w-12
            h-12
            rounded-2xl
            bg-[#1b2130]
            border
            border-zinc-700
            flex
            items-center
            justify-center
            text-zinc-400
            hover:text-white
            hover:border-violet-500
            transition
          "
        >

          <Settings size={18} />

        </button>

      </div>

    </div>

  );

}
