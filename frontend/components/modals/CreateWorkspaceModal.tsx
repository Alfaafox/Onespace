"use client";

interface CreateWorkspaceModalProps {

  open: boolean;

  workspaceName: string;

  workspaceDescription: string;

  setWorkspaceName: (
    value: string
  ) => void;

  setWorkspaceDescription: (
    value: string
  ) => void;

  onClose: () => void;

  onCreate: () => void;

}

export default function CreateWorkspaceModal({

  open,

  workspaceName,

  workspaceDescription,

  setWorkspaceName,

  setWorkspaceDescription,

  onClose,

  onCreate,

}: CreateWorkspaceModalProps) {

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
        w-[700px]
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
            Create Space
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





        <div className="space-y-6">

          <input
            type="text"
            placeholder="Space Name"
            value={workspaceName}
            onChange={(e) =>
              setWorkspaceName(
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
            placeholder="Description"
            value={
              workspaceDescription
            }
            onChange={(e) =>
              setWorkspaceDescription(
                e.target.value
              )
            }
            rows={6}
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
              Create
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}
