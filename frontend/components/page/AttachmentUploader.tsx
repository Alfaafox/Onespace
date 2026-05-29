"use client";

import axios from "axios";

import { useState } from "react";





interface Props {

  pageId: number;

}

export default function AttachmentUploader({

  pageId,

}: Props) {





  const [

    uploading,

    setUploading,

  ] = useState(false);





  const handleUpload =
    async (
      e:
        React.ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        e.target.files?.[0];





      if (!file) return;





      try {

        setUploading(true);





        const formData =
          new FormData();





        formData.append(
          "file",
          file
        );





        formData.append(
          "page_id",
          String(pageId)
        );





        const token =
          localStorage.getItem(
            "token"
          );





        await axios.post(

          `${process.env.NEXT_PUBLIC_API_URL}/attachments/upload`,

          formData,

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "multipart/form-data",

            },

          }

        );





        alert(
          "File uploaded successfully"
        );

      } catch (error) {

        console.log(error);





        alert(
          "Upload failed"
        );

      } finally {

        setUploading(false);

      }

  };





  return (

    <div className="
      mt-10
      border-t
      border-zinc-800
      pt-8
    ">

      <h2 className="
        text-3xl
        font-bold
        mb-6
        text-violet-500
      ">
        Attachments
      </h2>





      <label
        className="
          inline-flex
          items-center
          gap-4
          bg-violet-600
          hover:bg-violet-700
          transition
          rounded-2xl
          px-8
          py-4
          cursor-pointer
          font-semibold
        "
      >

        <input

          type="file"

          onChange={
            handleUpload
          }

          className="
            hidden
          "
        />





        {uploading
          ? "Uploading..."
          : "Upload File"}

      </label>

    </div>

  );

}
