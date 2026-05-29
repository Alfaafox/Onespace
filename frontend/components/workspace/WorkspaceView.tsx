"use client";

interface Workspace {

  id: number;

  name: string;

  description: string;

}



interface Page {

  id: number;

  title: string;

  content: string;

  workspace_id: number;

}



interface WorkspaceViewProps {

  workspace: Workspace | null;

  pages: Page[];

  onCreatePage: () => void;

  onSelectPage: (
    page: Page
  ) => void;

}

export default function WorkspaceView({

  workspace,

  pages,

  onCreatePage,

  onSelectPage,

}: WorkspaceViewProps) {

  if (!workspace) {

    return (

      <div className="
        h-full
        flex
        items-center
        justify-center
        text-zinc-500
        text-4xl
      ">
        No workspace selected
      </div>

    );

  }

  return (

    <div className="
      bg-[#0d0d14]
      border
      border-zinc-800
      rounded-[40px]
      p-12
      min-h-full
    ">

      <div className="
        flex
        items-start
        justify-between
      ">

        <div>

          <h1 className="
            text-8xl
            font-bold
            text-violet-500
          ">
            {workspace.name}
          </h1>

          <p className="
            text-4xl
            text-zinc-300
            mt-8
          ">
            {workspace.description}
          </p>

        </div>





        <button
          onClick={
            onCreatePage
          }
          className="
            bg-violet-600
            hover:bg-violet-700
            transition
            rounded-2xl
            px-8
            py-5
            text-2xl
            font-semibold
          "
        >
          + Create Page
        </button>

      </div>





      <div className="mt-20">

        <h2 className="
          text-5xl
          font-bold
          mb-10
        ">
          Pages
        </h2>





        {pages.length === 0 ? (

          <div className="
            bg-[#18181f]
            border
            border-zinc-800
            rounded-3xl
            p-10
            text-zinc-400
            text-2xl
          ">
            No pages yet.
          </div>

        ) : (

          <div className="
            grid
            grid-cols-2
            gap-8
          ">

            {pages.map(
              (page) => (

                <div
                  key={page.id}
                  onClick={() =>
                    onSelectPage(
                      page
                    )
                  }
                  className="
                    bg-[#18181f]
                    border
                    border-zinc-800
                    rounded-3xl
                    p-10
                    cursor-pointer
                    hover:bg-[#23232d]
                    transition
                  "
                >

                  <h3 className="
                    text-4xl
                    font-bold
                    text-violet-400
                  ">
                    {page.title}
                  </h3>

                  <p className="
                    text-zinc-400
                    text-2xl
                    mt-6
                    line-clamp-3
                  ">
                    {page.content}
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}
