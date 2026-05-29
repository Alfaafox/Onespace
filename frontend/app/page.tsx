"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  ChevronDown,
  FileText,
  Folder,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  X,
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
  workspace_id: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<number | null>(
    null
  );

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCreateSpaceModal, setShowCreateSpaceModal] = useState(false);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [showEditSpaceModal, setShowEditSpaceModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const [spaceName, setSpaceName] = useState("");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [editSpaceName, setEditSpaceName] = useState("");
  const [editSpaceDescription, setEditSpaceDescription] = useState("");

  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");

  const [creatingSpace, setCreatingSpace] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);
  const [savingSpace, setSavingSpace] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      setEditSpaceName(selectedWorkspace.name);
      setEditSpaceDescription(selectedWorkspace.description);
    }
  }, [selectedWorkspace]);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get("http://localhost:5000/workspaces", {
        headers: authHeaders(),
      });

      setWorkspaces(res.data);

      const workspaceFromQuery = searchParams.get("workspace");
      const queryWorkspace = workspaceFromQuery
        ? res.data.find((ws: Workspace) => String(ws.id) === workspaceFromQuery)
        : null;

      const firstWorkspace = res.data.length > 0 ? res.data[0] : null;
      const targetWorkspace = queryWorkspace || firstWorkspace;

      if (targetWorkspace) {
        setSelectedWorkspace(targetWorkspace);
        setExpandedWorkspaceId(targetWorkspace.id);
        fetchPages(targetWorkspace.id);
      } else {
        setSelectedWorkspace(null);
        setPages([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPages = async (workspaceId: number) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/pages/workspace/${workspaceId}`,
        {
          headers: authHeaders(),
        }
      );

      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch pages error:", err);
      setPages([]);
    }
  };

  const selectWorkspace = async (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setExpandedWorkspaceId(workspace.id);
    await fetchPages(workspace.id);
  };

  const toggleWorkspaceExpansion = async (workspace: Workspace) => {
    const isExpanded = expandedWorkspaceId === workspace.id;

    if (isExpanded) {
      setExpandedWorkspaceId(null);
      return;
    }

    setExpandedWorkspaceId(workspace.id);

    if (!selectedWorkspace || selectedWorkspace.id !== workspace.id) {
      setSelectedWorkspace(workspace);
      await fetchPages(workspace.id);
    }
  };

  const createWorkspace = async () => {
    if (!spaceName.trim()) return;

    try {
      setCreatingSpace(true);

      await axios.post(
        "http://localhost:5000/workspaces",
        {
          name: spaceName.trim(),
          description: spaceDescription.trim(),
        },
        {
          headers: authHeaders(),
        }
      );

      setShowCreateSpaceModal(false);
      setSpaceName("");
      setSpaceDescription("");
      await fetchWorkspaces();
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingSpace(false);
    }
  };

  const createPage = async () => {
    if (!selectedWorkspace || !pageTitle.trim()) return;

    try {
      setCreatingPage(true);

      await axios.post(
        "http://localhost:5000/pages",
        {
          title: pageTitle.trim(),
          content: pageContent.trim(),
          workspace_id: selectedWorkspace.id,
          parent_page_id: null,
        },
        {
          headers: authHeaders(),
        }
      );

      setShowCreatePageModal(false);
      setPageTitle("");
      setPageContent("");
      await fetchPages(selectedWorkspace.id);
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingPage(false);
    }
  };

  const shareWorkspace = async () => {
    if (!selectedWorkspace) return;

    const url = `${window.location.origin}/dashboard?workspace=${selectedWorkspace.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1500);
    } catch {
      window.alert(`Copy this link:\n${url}`);
    }
  };

  const saveWorkspace = async () => {
    if (!selectedWorkspace) return;

    const nextName = editSpaceName.trim() || selectedWorkspace.name;
    const nextDescription = editSpaceDescription.trim();

    try {
      setSavingSpace(true);

      // Try to persist if backend route exists; if not, keep UI working locally.
      await axios.put(
        `http://localhost:5000/workspaces/${selectedWorkspace.id}`,
        {
          name: nextName,
          description: nextDescription,
        },
        {
          headers: authHeaders(),
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.id === selectedWorkspace.id
            ? { ...ws, name: nextName, description: nextDescription }
            : ws
        )
      );

      setSelectedWorkspace((prev) =>
        prev ? { ...prev, name: nextName, description: nextDescription } : prev
      );

      setShowEditSpaceModal(false);
      setSavingSpace(false);
    }
  };

  const workspaceMatchesSearch = (workspace: Workspace) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;

    return (
      workspace.name.toLowerCase().includes(q) ||
      workspace.description.toLowerCase().includes(q)
    );
  };

  const visibleWorkspaces = useMemo(() => {
    const q = searchTerm.trim();
    if (!q) return workspaces;

    return workspaces.filter(
      (workspace) =>
        workspaceMatchesSearch(workspace) ||
        workspace.id === selectedWorkspace?.id
    );
  }, [searchTerm, workspaces, selectedWorkspace]);

  const visiblePages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return pages;

    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.content.toLowerCase().includes(q)
    );
  }, [searchTerm, pages]);

  const workspaceSearchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [] as Workspace[];

    return workspaces.filter(
      (workspace) =>
        workspace.name.toLowerCase().includes(q) ||
        workspace.description.toLowerCase().includes(q)
    );
  }, [searchTerm, workspaces]);

  const pageSearchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [] as Page[];

    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.content.toLowerCase().includes(q)
    );
  }, [searchTerm, pages]);

  return (
    <div className="h-screen flex bg-[#f5f7fb] overflow-hidden text-[#111827]">
      {/* SIDEBAR */}
      <div className="w-[268px] bg-white border-r border-[#e8edf3] flex flex-col shrink-0">
        {/* LOGO */}
        <div className="h-[72px] border-b border-[#eef2f7] flex items-center justify-center px-4 bg-white shrink-0">
          <img
            src="/onespace.png"
            alt="OneSpace"
            className="block h-[60px] w-auto max-w-[220px] object-contain object-center"
          />
        </div>

        {/* CREATE */}
        <div className="p-4 relative">
          <button
            onClick={() => setShowCreateMenu((prev) => !prev)}
            className="w-full h-[46px] rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[14px] font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={15} />
            Create
            <ChevronDown size={15} />
          </button>

          {showCreateMenu && (
            <div className="absolute top-[58px] left-4 right-4 bg-white border border-[#e5e7eb] rounded-2xl shadow-xl overflow-hidden z-20">
              <button
                onClick={() => {
                  setShowCreateMenu(false);
                  setShowCreateSpaceModal(true);
                }}
                className="w-full px-4 py-3 text-left text-[14px] hover:bg-[#f5f7fb] transition"
              >
                Create Space
              </button>
              <button
                onClick={() => {
                  setShowCreateMenu(false);
                  setShowCreatePageModal(true);
                }}
                className="w-full px-4 py-3 text-left text-[14px] hover:bg-[#f5f7fb] transition"
              >
                Create Page
              </button>
            </div>
          )}
        </div>

        {/* STATIC NAV BLOCKS */}
        <div className="px-4 pb-2">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[13px] font-medium text-[#334155] rounded-lg hover:bg-[#f5f7fb] cursor-default">
              Recent
            </div>
            <div className="px-3 py-2 text-[13px] font-medium text-[#334155] rounded-lg hover:bg-[#f5f7fb] cursor-default">
              Starred
            </div>
          </div>

          <div className="mt-3 px-3 text-[11px] font-semibold tracking-[2px] text-[#94a3b8] uppercase">
            Spaces
          </div>
        </div>

        {/* WORKSPACES */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <div className="space-y-2">
            {visibleWorkspaces.map((workspace) => {
              const isSelected = selectedWorkspace?.id === workspace.id;
              const isExpanded = expandedWorkspaceId === workspace.id;

              return (
                <div key={workspace.id}>
                  <div
                    className={`rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-white border-violet-300 shadow-sm"
                        : "bg-white border-[#edf1f5] hover:border-violet-200"
                    }`}
                  >
                    <div className="flex items-stretch gap-1 px-3 py-3">
                      <button
                        onClick={() => selectWorkspace(workspace)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-violet-100" : "bg-[#f4f6fa]"
                            }`}
                          >
                            <Folder
                              size={18}
                              className={
                                isSelected ? "text-violet-600" : "text-[#64748b]"
                              }
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3
                              className={`text-[15px] font-semibold truncate leading-5 ${
                                isSelected ? "text-violet-700" : "text-[#111827]"
                              }`}
                            >
                              {workspace.name}
                            </h3>

                            <p className="mt-1 text-[12px] text-[#64748b] leading-5 line-clamp-2">
                              {workspace.description}
                            </p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => toggleWorkspaceExpansion(workspace)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748b] hover:bg-[#f4f7fb] shrink-0 mt-0.5"
                        aria-label={isExpanded ? "Collapse workspace" : "Expand workspace"}
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* NESTED PAGES */}
                  {isExpanded && selectedWorkspace?.id === workspace.id && (
                    <div className="ml-4 mt-2 border-l border-[#eceff4] pl-3 space-y-1">
                      {visiblePages.length > 0 ? (
                        visiblePages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => router.push(`/page/${page.id}`)}
                            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#f4f7fb] transition-all"
                          >
                            <FileText size={14} className="text-[#64748b]" />
                            <span className="text-[13px] text-[#334155] truncate">
                              {page.title}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-[12px] text-[#94a3b8]">
                          No pages found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <div className="h-[72px] bg-white border-b border-[#e8edf3] px-8 flex items-center justify-between relative shrink-0">
          <div className="flex-1 flex justify-center relative">
            <div className="relative w-full max-w-[520px]">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search spaces and pages..."
                className="w-full h-[42px] rounded-xl border border-[#e5e7eb] bg-[#f8fafc] pl-11 pr-4 text-[14px] outline-none focus:border-violet-300"
              />

              {searchTerm.trim() && (
                <div className="absolute top-[48px] left-0 right-0 z-40 bg-white border border-[#e5e7eb] rounded-2xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#f1f5f9]">
                    <div className="text-[11px] tracking-[2px] uppercase text-[#94a3b8] font-semibold">
                      Spaces
                    </div>
                    <div className="mt-2 space-y-1">
                      {workspaceSearchResults.length > 0 ? (
                        workspaceSearchResults.map((workspace) => (
                          <button
                            key={workspace.id}
                            onClick={() => {
                              selectWorkspace(workspace);
                              setSearchTerm("");
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f5f7fb]"
                          >
                            <div className="text-[14px] font-medium text-[#111827]">
                              {workspace.name}
                            </div>
                            <div className="text-[12px] text-[#64748b] truncate">
                              {workspace.description}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-[12px] text-[#94a3b8]">
                          No matching spaces
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <div className="text-[11px] tracking-[2px] uppercase text-[#94a3b8] font-semibold">
                      Pages
                    </div>
                    <div className="mt-2 space-y-1">
                      {pageSearchResults.length > 0 ? (
                        pageSearchResults.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => {
                              router.push(`/page/${page.id}`);
                              setSearchTerm("");
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f5f7fb]"
                          >
                            <div className="text-[14px] font-medium text-[#111827]">
                              {page.title}
                            </div>
                            <div className="text-[12px] text-[#64748b] truncate">
                              {page.content || "No content"}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-[12px] text-[#94a3b8]">
                          No matching pages
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <button className="w-10 h-10 rounded-xl border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-[#f8fafc]">
              <Bell size={16} className="text-[#64748b]" />
            </button>
            <button className="w-10 h-10 rounded-xl border border-[#e5e7eb] bg-white flex items-center justify-center hover:bg-[#f8fafc]">
              <Settings size={16} className="text-[#64748b]" />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-10 h-10 rounded-xl border border-red-200 bg-white flex items-center justify-center hover:bg-red-50"
            >
              <LogOut size={16} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          {selectedWorkspace ? (
            <div className="max-w-[1100px] mx-auto">
              {/* Workspace header */}
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-[30px] font-bold tracking-[-0.5px] text-[#111827]">
                    {selectedWorkspace.name}
                  </h1>
                  <p className="mt-2 text-[14px] text-[#64748b] leading-7 max-w-2xl">
                    {selectedWorkspace.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setShowEditSpaceModal(true);
                      setEditSpaceName(selectedWorkspace.name);
                      setEditSpaceDescription(selectedWorkspace.description);
                    }}
                    className="h-[40px] px-4 rounded-2xl bg-[#f3f4f6] text-[#334155] flex items-center gap-2 hover:bg-[#e5e7eb] transition"
                  >
                    <Pencil size={15} />
                    Edit Space
                  </button>

                  <button
                    onClick={shareWorkspace}
                    className="h-[40px] px-4 rounded-2xl bg-[#f3f4f6] text-[#334155] flex items-center gap-2 hover:bg-[#e5e7eb] transition"
                  >
                    <Share2 size={15} />
                    {shareCopied ? "Copied" : "Share"}
                  </button>

                  <button
                    onClick={() => setShowCreatePageModal(true)}
                    className="h-[40px] px-5 rounded-2xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[14px] flex items-center gap-2 hover:opacity-90 transition"
                  >
                    <Plus size={15} />
                    Create Page
                  </button>
                </div>
              </div>

              {/* Pages header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-semibold text-[#111827]">
                  Pages
                </h2>
                <span className="text-[13px] text-[#64748b]">
                  {visiblePages.length} pages
                </span>
              </div>

              {/* Pages list */}
              <div className="space-y-3">
                {visiblePages.length > 0 ? (
                  visiblePages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => router.push(`/page/${page.id}`)}
                      className="w-full bg-white border border-[#e8edf3] rounded-2xl px-5 py-4 text-left hover:border-violet-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#f5f7fb] flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[15px] font-semibold text-[#111827] truncate">
                            {page.title}
                          </h3>
                          <p className="mt-1 text-[13px] text-[#64748b] line-clamp-2">
                            {page.content || "No content available"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="bg-white border border-dashed border-[#dbe1ea] rounded-2xl px-5 py-8 text-center text-[14px] text-[#94a3b8]">
                    No pages available in this space.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#94a3b8] text-[15px]">
              No workspace selected
            </div>
          )}
        </div>
      </div>

      {/* CREATE SPACE MODAL */}
      {showCreateSpaceModal && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-[520px] bg-white rounded-[24px] p-7 border border-[#ececec] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[26px] font-bold">Create Space</h2>
              <button
                onClick={() => setShowCreateSpaceModal(false)}
                className="w-9 h-9 rounded-xl bg-[#f3f4f6] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Space name"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full h-[48px] rounded-2xl border border-[#d1d5db] px-4 text-[14px] outline-none focus:border-violet-500"
            />

            <textarea
              placeholder="Space description"
              value={spaceDescription}
              onChange={(e) => setSpaceDescription(e.target.value)}
              className="w-full h-[140px] rounded-2xl border border-[#d1d5db] px-4 py-3 text-[14px] outline-none focus:border-violet-500 mt-4 resize-none"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateSpaceModal(false)}
                className="h-[44px] px-5 rounded-2xl bg-[#f3f4f6] text-[14px]"
              >
                Cancel
              </button>
              <button
                onClick={createWorkspace}
                disabled={creatingSpace}
                className="h-[44px] px-6 rounded-2xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[14px] font-medium disabled:opacity-50"
              >
                {creatingSpace ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PAGE MODAL */}
      {showCreatePageModal && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-[620px] bg-white rounded-[24px] p-7 border border-[#ececec] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[26px] font-bold">Create Page</h2>
              <button
                onClick={() => setShowCreatePageModal(false)}
                className="w-9 h-9 rounded-xl bg-[#f3f4f6] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Page title"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full h-[48px] rounded-2xl border border-[#d1d5db] px-4 text-[14px] outline-none focus:border-violet-500"
            />

            <textarea
              placeholder="Page content"
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
              className="w-full h-[180px] rounded-2xl border border-[#d1d5db] px-4 py-3 text-[14px] outline-none focus:border-violet-500 mt-4 resize-none"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreatePageModal(false)}
                className="h-[44px] px-5 rounded-2xl bg-[#f3f4f6] text-[14px]"
              >
                Cancel
              </button>
              <button
                onClick={createPage}
                disabled={creatingPage}
                className="h-[44px] px-6 rounded-2xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[14px] font-medium disabled:opacity-50"
              >
                {creatingPage ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SPACE MODAL */}
      {showEditSpaceModal && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-[520px] bg-white rounded-[24px] p-7 border border-[#ececec] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[26px] font-bold">Edit Space</h2>
              <button
                onClick={() => setShowEditSpaceModal(false)}
                className="w-9 h-9 rounded-xl bg-[#f3f4f6] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Space name"
              value={editSpaceName}
              onChange={(e) => setEditSpaceName(e.target.value)}
              className="w-full h-[48px] rounded-2xl border border-[#d1d5db] px-4 text-[14px] outline-none focus:border-violet-500"
            />

            <textarea
              placeholder="Space description"
              value={editSpaceDescription}
              onChange={(e) => setEditSpaceDescription(e.target.value)}
              className="w-full h-[140px] rounded-2xl border border-[#d1d5db] px-4 py-3 text-[14px] outline-none focus:border-violet-500 mt-4 resize-none"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditSpaceModal(false)}
                className="h-[44px] px-5 rounded-2xl bg-[#f3f4f6] text-[14px]"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkspace}
                disabled={savingSpace}
                className="h-[44px] px-6 rounded-2xl bg-gradient-to-r from-violet-700 to-fuchsia-500 text-white text-[14px] font-medium disabled:opacity-50"
              >
                {savingSpace ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
