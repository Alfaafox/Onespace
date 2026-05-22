"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  Upload,
  User,
  X,
} from "lucide-react";

interface PageData {
  id: number;
  title: string;
  content: string;
  workspace_id: number;
  created_at: string;
}

interface Attachment {
  id: number;
  filename: string;
  filepath: string;
  mimetype: string;
}

export default function PageView() {
  const params = useParams();
  const router = useRouter();

  const [page, setPage] = useState<PageData | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingPage, setSavingPage] = useState(false);

  const pageId = params.id;

  useEffect(() => {
    if (pageId) {
      fetchPage();
      fetchAttachments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  useEffect(() => {
    if (page) {
      setEditTitle(page.title || "");
      setEditContent(page.content || "");
    }
  }, [page]);

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://192.168.11.69:5000/pages/${pageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPage(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttachments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://192.168.11.69:5000/attachments/${pageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAttachments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("page_id", String(pageId));

      await axios.post(
        "http://192.168.11.69:5000/attachments/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSelectedFile(null);
      fetchAttachments();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const savePage = async () => {
    if (!pageId) return;

    const nextTitle = editTitle.trim() || page?.title || "";
    const nextContent = editContent;

    try {
      setSavingPage(true);

      // Try to persist if the backend has an update route.
      await axios.put(
        `http://192.168.11.69:5000/pages/${pageId}`,
        {
          title: nextTitle,
          content: nextContent,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setPage((prev) =>
        prev
          ? {
              ...prev,
              title: nextTitle,
              content: nextContent,
            }
          : prev
      );

      setShowEditModal(false);
      setSavingPage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      {/* TOP BAR */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#e8edf3]">
        <div className="max-w-[1200px] mx-auto h-[64px] px-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[14px] text-[#64748b] hover:text-violet-600 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="h-[40px] px-5 rounded-2xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[14px] font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Pencil size={15} />
            Edit Page
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-7">
        {/* PAGE HEADER */}
        <div className="bg-white border border-[#ebeef5] rounded-[24px] px-7 py-8 shadow-sm">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-semibold tracking-wide mb-5">
              <FileText size={13} />
              DOCUMENT SPACE
            </div>

            <h1 className="text-[28px] leading-[34px] font-bold tracking-[-1px] text-violet-700 break-words">
              {page?.title}
            </h1>

            <p className="mt-4 text-[15px] leading-[28px] text-[#64748b] max-w-3xl">
              {page?.content || "Collaborative workspace document."}
            </p>

            <div className="flex items-center gap-7 mt-6 text-[13px] text-[#64748b]">
              <div className="flex items-center gap-2">
                <Clock3 size={15} />
                Recently Updated
              </div>

              <div className="flex items-center gap-2">
                <User size={15} />
                OneSpace User
              </div>
            </div>
          </div>
        </div>

        {/* ATTACHMENTS */}
        <div className="mt-5 bg-white border border-[#ebeef5] rounded-[24px] shadow-sm overflow-hidden">
          {/* TOP ROW */}
          <div className="px-7 py-5 border-b border-[#f1f5f9] flex items-center justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-[22px] font-bold text-[#111827]">
                Attachments
              </h2>

              <p className="mt-1 text-[13px] text-[#64748b]">
                Upload and manage supporting files.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="text-[13px] bg-[#f8fafc] border border-[#dbe2ea] rounded-xl px-4 py-2.5 w-[320px]"
              />

              <button
                onClick={uploadFile}
                disabled={uploading}
                className="h-[42px] px-5 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[13px] font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload File"}
              </button>
            </div>
          </div>

          {/* FILE LIST */}
          <div className="p-5">
            <div className="space-y-3">
              {attachments.length > 0 ? (
                attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-2xl border border-[#e8edf3] bg-[#fcfcfd] px-4 py-4 hover:border-violet-300 hover:bg-white transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-violet-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold text-[#111827] truncate max-w-[600px]">
                          {file.filename}
                        </h3>

                        <p className="mt-1 text-[12px] text-[#64748b]">
                          {file.mimetype}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`http://192.168.11.69:5000/uploads/${file.filepath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-[36px] px-4 rounded-xl border border-[#d1d5db] bg-white flex items-center gap-2 text-[12px] hover:border-violet-400 transition-all"
                      >
                        <ExternalLink size={14} />
                        Open
                      </a>

                      <a
                        href={`http://192.168.11.69:5000/uploads/${file.filepath}`}
                        download
                        className="h-[36px] px-4 rounded-xl bg-violet-600 text-white flex items-center gap-2 text-[12px] hover:bg-violet-700 transition-all"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#dbe2ea] bg-[#fafafa] py-10 text-center text-[14px] text-[#64748b]">
                  No attachments uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-[680px] rounded-[24px] bg-white shadow-2xl border border-[#ececec] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9]">
              <h3 className="text-[22px] font-bold text-[#111827]">
                Edit Page
              </h3>

              <button
                onClick={() => setShowEditModal(false)}
                className="w-9 h-9 rounded-xl bg-[#f3f4f6] flex items-center justify-center hover:bg-[#e5e7eb]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-[13px] font-medium text-[#334155] mb-2">
                Title
              </label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-[48px] rounded-2xl border border-[#dbe2ea] px-4 text-[14px] outline-none focus:border-violet-500"
              />

              <label className="block text-[13px] font-medium text-[#334155] mb-2 mt-4">
                Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-[220px] rounded-2xl border border-[#dbe2ea] px-4 py-3 text-[14px] outline-none focus:border-violet-500 resize-none"
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="h-[42px] px-5 rounded-xl bg-[#f3f4f6] text-[14px] text-[#334155]"
                >
                  Cancel
                </button>

                <button
                  onClick={savePage}
                  disabled={savingPage}
                  className="h-[42px] px-5 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[14px] font-medium disabled:opacity-50"
                >
                  {savingPage ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
