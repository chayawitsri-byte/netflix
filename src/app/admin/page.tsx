"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LicenseKey {
  code: string;
  createdAt: number;
  expiresAt: number;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(3600000); // Default 1 hour

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/admin/keys", {
        headers: { "x-admin-key": adminKey },
      });
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to fetch keys");
    }
  };

  const generateKey = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ durationMs: duration }),
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error("Failed to generate key");
    }
    setLoading(false);
  };

  const handleDelete = async (code: string) => {
    try {
      const res = await fetch("/api/admin/keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        fetchKeys();
      }
    } catch (error) {
      console.error("Failed to delete key");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl text-center text-zinc-100">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
            <Button onClick={fetchKeys} className="w-full bg-red-600 hover:bg-red-700">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-100">Key Management</h1>
          <Button variant="ghost" onClick={() => setIsAuthenticated(false)} className="text-zinc-400">
            Logout
          </Button>
        </div>

        {/* Generator Section */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">Generate New Key</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 flex-1"
            >
              <option value={3600000}>1 Hour</option>
              <option value={86400000}>1 Day</option>
              <option value={604800000}>7 Days</option>
              <option value={2592000000}>30 Days</option>
              <option value={31536000000}>1 Year</option>
            </select>
            <Button onClick={generateKey} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "Generating..." : "Generate Key"}
            </Button>
          </CardContent>
        </Card>

        {/* Keys Table */}
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100">Active Keys ({keys.length})</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Key Code</th>
                  <th className="px-6 py-3 font-medium">Expires At</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {keys.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                      No keys found.
                    </td>
                  </tr>
                ) : (
                  keys.map((key) => {
                    const isExpired = Date.now() > key.expiresAt;
                    return (
                      <tr key={key.code} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-red-400 font-mono text-sm">{key.code}</code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-zinc-300 text-sm">
                              {new Date(key.expiresAt).toLocaleString()}
                            </span>
                            {isExpired && (
                              <Badge variant="destructive" className="mt-1 w-fit">Expired</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(key.code)}
                            className="text-zinc-500 hover:text-red-500"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
