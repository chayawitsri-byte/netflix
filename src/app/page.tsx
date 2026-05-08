"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AuthGate } from "@/components/AuthGate";

interface LinkEntry {
  id: string;
  token: string;
  createdAt: string;
}

export default function Home() {
  const [links, setLinks] = useState<LinkEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const generateLinks = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinks((prev) => [...prev, data.link]);
        showNotification(data.message, "success");
      } else {
        showNotification(data.error, "error");
      }
    } catch {
      showNotification("Failed to generate link", "error");
    }
    setGenerating(false);
  };

  const deleteLink = (token: string) => {
    setLinks((prev) => prev.filter((l) => l.token !== token));
  };

  const copyToClipboard = async (token: string) => {
    const url = `${window.location.origin}/go/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showNotification("Copied to clipboard!", "success");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getCloakedUrl = (token: string) => {
    if (typeof window !== "undefined") return `${window.location.origin}/go/${token}`;
    return `/go/${token}`;
  };

  const filteredLinks = links.filter(
    (l) => l.token.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <AuthGate>
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border animate-slide-up ${notification.type === "success"
          ? "bg-emerald-950 text-emerald-400 border-emerald-800"
          : "bg-red-950 text-red-400 border-red-800"
          }`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Center Content */}
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Arty</h1>
          <p className="text-zinc-500 text-sm mt-1">GEN NETFLIX BY ARTY</p>
        </div>

        {/* Generate Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 mb-4">
          <Button id="generate-btn" onClick={generateLinks} disabled={generating} className="w-full" size="lg">
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                กำลังสร้าง...
              </span>
            ) : (
              <span className="flex items-center gap-2">📂 Generator Netflix</span>
            )}
          </Button>
        </div>

        {/* View Links Button */}
        <Button variant="outline" className="w-full" onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          ดูลิ้งค์ทั้งหมด
          <Badge variant="secondary" className="ml-2">{links.length}</Badge>
        </Button>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl max-h-[80vh] rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">ลิ้งค์ที่สร้างแล้ว</h2>
                <p className="text-sm text-zinc-500">{filteredLinks.length} จาก {links.length} ลิ้งค์</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  id="search-input"
                  placeholder="ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40"
                />
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {filteredLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  </div>
                  <p className="text-zinc-500 text-sm">ยังไม่มีลิ้งค์</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLinks.map((link, index) => (
                    <div key={link.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-zinc-800 bg-zinc-800/30">
                      <div className="hidden sm:flex w-7 h-7 rounded-md bg-zinc-800 items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-zinc-500">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="success" className="text-[10px] shrink-0">LINK</Badge>
                          <code className="text-sm font-mono text-red-400 truncate">{getCloakedUrl(link.token)}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.token)}>
                          {copiedToken === link.token ? (
                            <span className="flex items-center gap-1 text-emerald-400"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</span>
                          ) : (
                            <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</span>
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteLink(link.token)} className="text-zinc-600 hover:text-red-500 hover:bg-red-950">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-4 text-center">
        <p className="text-zinc-700 text-xs">Link Cloaker — Custom Domain Link Generator</p>
      </footer>
    </main>
  </AuthGate>
  );
}
