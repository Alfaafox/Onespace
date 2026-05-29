"use client";

import Link from "next/link";

import { useState } from "react";





interface Page {

  id: number;

  title: string;

  content: string;

  parent_page_id?: number | null;

}





interface Props {

  pages: Page[];

  selectedPage: Page | null;

  onSelectPage: (
    page: Page
  ) => void;

}

export default function PageTree({

  pages,

  selectedPage,

  onSelectPage,

}: Props) {





  const [

    expandedPages,

    setExpandedPages,

  ] = useState<number[]>([]);





  const toggleExpand = (
    pageId: number
  ) => {

    if (
      expandedPages.includes(
        pageId
      )
    ) {

      setExpandedPages(

        expandedPages.filter(
          (id) =>
            id !== pageId
        )

      );

    } else {

      setExpandedPages([
        ...expandedPages,
        pageId,
      ]);

    }

  };





  const hasChildren = (
    pageId: number
  ) => {

    return pages.some(

      (page) =>

        page.parent_page_id
        === pageId

    );

  };





  const renderPages = (

    parentId:
      number | null = null,

    level: number = 0

  ) => {

    return pages

      .filter(

        (page) =>

          (page.parent_page_id || null)
          === parentId

      )

      .map((page) => {

        const childrenExist =
          hasChildren(page.id);





        const expanded =
          expandedPages.includes(
            page.id
          );





        return (

          <div
            key={page.id}
          >

            <div
              style={{
                marginLeft:
                  `${level * 20}px`,
              }}
              className="
                flex
                items-center
                gap-2
                mb-2
              "
            >

              {childrenExist ? (

                <button

                  onClick={() =>
                    toggleExpand(
                      page.id
                    )
                  }

                  className="
                    text-zinc-500
                    hover:text-white
                    transition
                    w-[20px]
                  "
                >

                  {expanded
                    ? "▼"
                    : "▶"}

                </button>

              ) : (

                <div className="
                  w-[20px]
                " />

              )}





              <Link

                href={`/page/${page.id}`}

                className={`
                  flex-1
                  text-left
                  rounded-xl
                  px-4
                  py-3
                  transition
                  border

                  ${
                    selectedPage?.id ===
                    page.id

                      ? `
                        bg-violet-600
                        border-violet-500
                        text-white
                      `

                      : `
                        bg-[#18181f]
                        border-zinc-800
                        hover:bg-[#23232d]
                        text-zinc-300
                      `
                  }
                `}
              >

                <p className="
                  font-semibold
                  text-base
                  truncate
                ">
                  {page.title}
                </p>

              </Link>

            </div>





            {childrenExist &&
              expanded &&

              renderPages(
                page.id,
                level + 1
              )}

          </div>

        );

      });

  };





  return (

    <div className="
      mt-6
    ">

      <h2 className="
        text-zinc-500
        text-sm
        uppercase
        mb-4
      ">
        Pages
      </h2>





      <div>

        {renderPages()}

      </div>

    </div>

  );

}
