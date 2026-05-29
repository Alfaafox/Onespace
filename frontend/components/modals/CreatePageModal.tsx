"use client";





interface Page {

  id: number;

  title: string;

}





interface CreatePageModalProps {

  open: boolean;

  pageTitle: string;

  pageContent: string;

  pages: Page[];

  selectedParentPage:
    number | null;

  setSelectedParentPage: (
    value: number | null
  ) => void;

  setPageTitle: (
    value: string
  ) => void;

  setPageContent: (
    value: string
  ) => void;

  onClose: () => void;

  onCreate: () => void;

}

export default function CreatePageModal({

  open,

  pageTitle,

  pageContent,

  pages,

  selectedParentPage,

  setSelectedParentPage,

  setPageTitle,

  setPageContent,

  onClose,

  onCreate,

}: CreatePageModalProps) {

  if (!open) return null;





  return (

    <div className="
      fixed
      inset-0
      bg-black/70
      flex
      items-center
      justify-center
      z-50
    ">

      <div className="
        bg-[#11111a]
        border
        border-zinc-800
        rounded-[40px]
        w-[900px]
        p-10
      ">

        <div className="
          flex
          items-center
          justify-between
          mb-10
        ">

          <h2 className="
            text-6xl
            font-bold
            text-violet-500
          ">
            Create Page
          </h2>





          <button
            onClick={onClose}
            className="
              text-zinc-400
              text-5xl
            "
          >
            ×
          </button>

        </div>





        <div className="
          space-y-6
        ">

          <input
            type="text"
            placeholder="Page Title"
            value={pageTitle}
            onChange={(e) =>
              setPageTitle(
                e.target.value
              )
            }
            className="
              w-full
              bg-black
              border
              border-zinc-700
              rounded-2xl
              px-6
              py-5
              text-3xl
              outline-none
            "
          />





          <textarea
            placeholder="Page Content"
            value={pageContent}
            onChange={(e) =>
              setPageContent(
                e.target.value
              )
            }
            rows={10}
            className="
              w-full
              bg-black
              border
              border-zinc-700
              rounded-2xl
              px-6
              py-5
              text-2xl
              outline-none
              resize-none
            "
          />





          {/* PARENT PAGE SELECTOR */}

          <div>

            <label className="
              block
              text-zinc-400
              text-xl
              mb-3
            ">
              Parent Page
            </label>





            <select
              value={
                selectedParentPage || ""
              }
              onChange={(e) =>

                setSelectedParentPage(

                  e.target.value

                    ? Number(
                        e.target.value
                      )

                    : null

                )

              }
              className="
                w-full
                bg-black
                border
                border-zinc-700
                rounded-2xl
                px-6
                py-5
                text-2xl
                outline-none
              "
            >

              <option value="">
                No Parent Page
              </option>





              {pages.map((page) => (

                <option
                  key={page.id}
                  value={page.id}
                >
                  {page.title}
                </option>

              ))}

            </select>

          </div>





          <div className="
            flex
            justify-end
            gap-5
            pt-6
          ">

            <button
              onClick={onClose}
              className="
                bg-zinc-700
                hover:bg-zinc-600
                transition
                rounded-2xl
                px-8
                py-5
                text-2xl
              "
            >
              Cancel
            </button>





            <button
              onClick={onCreate}
              className="
                bg-violet-600
                hover:bg-violet-700
                transition
                rounded-2xl
                px-10
                py-5
                text-2xl
                font-semibold
              "
            >
              Create Page
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}
