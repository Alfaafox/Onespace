"use client";

interface Page {

  id: number;

  title: string;

  content: string;

  workspace_id: number;

}

interface PageViewerProps {

  page: Page | null;

}

export default function PageViewer({

  page,

}: PageViewerProps) {

  if (!page) {

    return (

      <div className="
        bg-[#0d0d14]
        border
        border-zinc-800
        rounded-[40px]
        p-16
        min-h-full
        flex
        items-center
        justify-center
      ">

        <div className="
          text-center
        ">

          <h1 className="
            text-7xl
            font-bold
            text-violet-500
            mb-8
          ">
            OneSpace
          </h1>

          <p className="
            text-3xl
            text-zinc-400
            max-w-[900px]
            leading-relaxed
          ">
            Select a page to start viewing
            workspace documentation and
            collaboration content.
          </p>

        </div>

      </div>

    );

  }

  return (

    <div className="
      bg-[#0d0d14]
      border
      border-zinc-800
      rounded-[40px]
      p-16
      min-h-full
    ">

      <h1 className="
        text-7xl
        font-bold
        text-violet-500
        mb-10
      ">
        {page.title}
      </h1>





      <div className="
        text-zinc-300
        text-3xl
        leading-relaxed
        whitespace-pre-wrap
      ">
        {page.content}
      </div>

    </div>

  );

}
