"use client";

import Image from "next/image";

import {
  Building2,
  ChevronRight,
  FileText,
  Plus,
  Settings,
} from "lucide-react";

interface Workspace {
  id: number;
  name: string;
  description: string;
}

interface Page {
  id: number;
  title: string;
  content: string;
}

interface Props {
  workspaces: Workspace[];

  selectedWorkspace:
    Workspace | null;

  onSelectWorkspace: (
    workspace: Workspace
  ) => void;

  onCreateWorkspace:
    () => void;

  pages: Page[];

  selectedPage:
    Page | null;

  onSelectPage: (
    page: Page
  ) => void;
}

export default function Sidebar({
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
  pages,
  selectedPage,
  onSelectPage,
}: Props) {

  return (

    <div
      className="
        w-[290px]
        min-h-screen
        bg-[#f7f8fc]
        border-r
        border-zinc-200
        flex
        flex-col
      "
    >

      {/* LOGO */}

      <div
        className="
          w-full
          h-[160px]
          flex
          items-center
          justify-center
          border-b
          border-zinc-200
          px-6
          bg-white
        "
      >

        <Image
          src="/onespace.png"
          alt="OneSpace"
          width={250}
          height={90}
          priority
          style={{
            width: "250px",
            height: "auto",
            objectFit: "contain",
          }}
        />

      </div>





      {/* CREATE BUTTON */}

      <div className="px-5 py-5">

        <button
          onClick={onCreateWorkspace}
          className="
            w-full
            h-[58px]
            rounded-2xl
            bg-gradient-to-r
            from-violet-600
            to-purple-500
            text-white
            font-semibold
            text-[17px]
            flex
            items-center
            justify-center
            gap-2
            shadow-lg
            shadow-violet-500/20
            hover:scale-[1.01]
            transition-all
          "
        >

          <Plus size={18} />

          Create Space

        </button>

      </div>





      {/* SECTION */}

      <div
        className="
          flex
          items-center
          justify-between
          px-5
          mb-3
        "
      >

        <span
          className="
            text-[11px]
            font-bold
            tracking-[0.28em]
            text-zinc-500
          "
        >
          SPACES
        </span>

        <span
          className="
            text-xs
            text-zinc-400
            font-medium
          "
        >
          {workspaces.length}
        </span>

      </div>





      {/* WORKSPACES */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-3
          pb-5
        "
      >

        <div className="space-y-3">

          {workspaces.map(
            (workspace) => {

              const active =
                selectedWorkspace?.id ===
                workspace.id;

              return (

                <div
                  key={workspace.id}
                  className="
                    rounded-3xl
                  "
                >

                  {/* WORKSPACE BUTTON */}

                  <button
                    onClick={() =>
                      onSelectWorkspace(
                        workspace
                      )
                    }
                    className={`
                      w-full
                      rounded-3xl
                      border
                      p-4
                      text-left
                      transition-all

                      ${
                        active

                          ? `
                            bg-gradient-to-br
                            from-violet-600
                            to-purple-500
                            border-violet-400
                            shadow-lg
                            shadow-violet-500/20
                          `

                          : `
                            bg-white
                            border-zinc-200
                            hover:border-violet-300
                            hover:shadow-md
                          `
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        gap-3
                        items-start
                      "
                    >

                      <div
                        className={`
                          mt-1

                          ${
                            active
                              ? "text-white"
                              : "text-violet-600"
                          }
                        `}
                      >

                        <Building2 size={17} />

                      </div>





                      <div
                        className="
                          flex-1
                          min-w-0
                        "
                      >

                        <h3
                          className={`
                            text-[16px]
                            font-semibold
                            truncate

                            ${
                              active
                                ? "text-white"
                                : "text-zinc-900"
                            }
                          `}
                        >

                          {workspace.name}

                        </h3>





                        <p
                          className={`
                            text-[12px]
                            mt-1
                            leading-relaxed
                            line-clamp-2

                            ${
                              active
                                ? "text-violet-100"
                                : "text-zinc-500"
                            }
                          `}
                        >

                          {
                            workspace.description
                          }

                        </p>

                      </div>

                    </div>

                  </button>





                  {/* PAGES */}

                  {active && (

                    <div
                      className="
                        mt-3
                        bg-white
                        border
                        border-zinc-200
                        rounded-3xl
                        p-3
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          px-1
                          mb-3
                        "
                      >

                        <span
                          className="
                            text-[11px]
                            font-bold
                            tracking-[0.25em]
                            text-zinc-500
                          "
                        >
                          PAGES
                        </span>

                        <span
                          className="
                            text-xs
                            text-zinc-400
                          "
                        >
                          {pages.length}
                        </span>

                      </div>





                      <div className="space-y-2">

                        {pages.map(
                          (page) => {

                            const selected =
                              selectedPage?.id ===
                              page.id;

                            return (

                              <button
                                key={page.id}
                                onClick={() =>
                                  onSelectPage(page)
                                }
                                className={`
                                  w-full
                                  h-[48px]
                                  rounded-2xl
                                  border
                                  flex
                                  items-center
                                  gap-3
                                  px-3
                                  transition-all

                                  ${
                                    selected

                                      ? `
                                        bg-[#0f172a]
                                        border-violet-500
                                        text-white
                                        shadow-md
                                      `

                                      : `
                                        bg-[#fafafa]
                                        border-zinc-200
                                        hover:border-violet-300
                                        hover:bg-white
                                      `
                                  }
                                `}
                              >

                                <ChevronRight
                                  size={14}
                                  className="
                                    text-zinc-400
                                    shrink-0
                                  "
                                />

                                <FileText
                                  size={15}
                                  className="
                                    text-violet-500
                                    shrink-0
                                  "
                                />





                                <div
                                  className="
                                    flex-1
                                    min-w-0
                                    text-left
                                  "
                                >

                                  <span
                                    className={`
                                      block
                                      text-sm
                                      font-medium
                                      truncate

                                      ${
                                        selected
                                          ? "text-white"
                                          : "text-zinc-900"
                                      }
                                    `}
                                  >

                                    {page.title}

                                  </span>

                                </div>

                              </button>

                            );

                          }
                        )}

                      </div>

                    </div>

                  )}

                </div>

              );

            }
          )}

        </div>

      </div>





      {/* PROFILE */}

      <div
        className="
          border-t
          border-zinc-200
          bg-white
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-11
                h-11
                rounded-2xl
                bg-gradient-to-br
                from-violet-600
                to-purple-500
                flex
                items-center
                justify-center
                text-white
                font-bold
              "
            >

              G

            </div>





            <div>

              <div
                className="
                  text-sm
                  font-semibold
                  text-zinc-900
                "
              >
                Guru
              </div>

              <div
                className="
                  text-xs
                  text-zinc-500
                "
              >
                Administrator
              </div>

            </div>

          </div>





          <button
            className="
              w-10
              h-10
              rounded-xl
              border
              border-zinc-200
              flex
              items-center
              justify-center
              hover:bg-zinc-100
              transition
            "
          >

            <Settings
              size={17}
              className="
                text-zinc-600
              "
            />

          </button>

        </div>

      </div>

    </div>

  );

}
