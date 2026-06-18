import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pengajuan Keluhan Tiket Tenant" },
      {
        name: "description",
        content:
          "Form pengajuan tiket keluhan tenant terhadap unit properti yang disewa.",
      },
      { property: "og:title", content: "Pengajuan Keluhan Tiket Tenant" },
      {
        property: "og:description",
        content:
          "Form pengajuan tiket keluhan tenant terhadap unit properti yang disewa.",
      },
    ],
  }),
  component: Index,
});

type Listing = {
  id: number | string;
  name?: string;
  address?: string;
  [k: string]: unknown;
};
type Contract = {
  id: number | string;
  tenant_name?: string;
  listing_id?: number | string;
  status?: string;
  [k: string]: unknown;
};
type Ticket = {
  id: number | string;
  listing_id?: number | string;
  contract_id?: number | string;
  tenant_name?: string;
  tenant_email?: string;
  description?: string;
  status?: string;
  soap_receipt?: string;
  [k: string]: unknown;
};

const LS_KEY = "service_urls_v1";
const DEFAULTS = {
  tickets: "http://localhost:8002/api/v1/ticket-service",
  ticketsToken:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImlhZS1jZW50cmFsLTIwMjYifQ.eyJpc3MiOiJpYWUtY2VudHJhbC1tb2NrIiwic3ViIjoid2FyZ2EwMUBrdHAuaWFlLmlkIiwiaWF0IjoxNzgxNzkxMjk2LCJleHAiOjE3ODE3OTQ4OTYsImdyYW50X3R5cGUiOiJwYXNzd29yZCIsInRva2VuX3R5cGUiOiJ1c2VyIiwicHJvZmlsZSI6eyJuYW1lIjoiQWhtYWQgUml6a2kgUHJhdGFtYSIsIm5pbSI6IjIwMjYwMDAwMDEiLCJlbWFpbCI6IndhcmdhMDFAa3RwLmlhZS5pZCJ9fQ.hPNl2d-yXVeTg4MOrb9aK_JhvTwBvjdFvypOvP97QhBbhfbJdHsighwPZJqFtFq3ZcxuBicDeuxXyAMs5JR3wIisMGiB9H0PUeJG3cQaH8GuoWNYfWaO5yBeCxlN85TrI27zER2DxHgl6gDAPPqLd0l-LFaI9zoXPW7j58oGQyD05cbQ4qKKPg0FA1MtlzLwJK-nHSNfztXWXcnVa9TkR_TVAp6TZIpqSjtHUKFuD0y38tRf9BT9b6jcD65lUtrCMO2WAMyKcS8cqyBBIeFbnpBgfYBFvtIVP8kH2iiaihmDxXy8YJzVIiWGAfXrSKDdxnpke8jdkuWa5QYhI-2Acg",
  listings: "http://localhost:8001/api/v1/listing-service",
  contracts: "http://localhost:8000/api/v1/contract-service",
};

function loadUrls() {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function authHeaders(token: string) {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;
  if (!res.ok) {
    const msg =
      data &&
      typeof data === "object" &&
      "message" in (data as Record<string, unknown>)
        ? String((data as { message: unknown }).message)
        : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data as T;
}

function unwrap<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (
      obj.data &&
      typeof obj.data === "object" &&
      Array.isArray((obj.data as Record<string, unknown>).data)
    ) {
      return (obj.data as { data: T[] }).data;
    }
  }
  return [];
}

function Index() {
  const [urls, setUrls] = useState(DEFAULTS);
  const [listings, setListings] = useState<Listing[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [listingId, setListingId] = useState("");
  const [contractId, setContractId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("kerusakan");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setUrls(loadUrls());
  }, []);

  const refreshAll = async () => {
    setLoadingTickets(true);
    const r1 = jsonFetch(`${urls.listings}/listings`)
      .then((d) => setListings(unwrap<Listing>(d)))
      .catch(() => setListings([]));
    const r2 = jsonFetch(`${urls.contracts}/contracts`)
      .then((d) => setContracts(unwrap<Contract>(d)))
      .catch(() => setContracts([]));
    const r3 = jsonFetch(`${urls.tickets}/tickets`, {
      headers: authHeaders(urls.ticketsToken),
    })
      .then((d) => setTickets(unwrap<Ticket>(d)))
      .catch(() => setTickets([]));
    await Promise.allSettled([r1, r2, r3]);
    setLoadingTickets(false);
  };

  useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.tickets, urls.listings, urls.contracts]);

  const saveUrls = (next: typeof DEFAULTS) => {
    setUrls(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    toast.success("URL service tersimpan");
  };

  const submitTicket = async (e: FormEvent) => {
    e.preventDefault();
    if (!listingId || !contractId || !title.trim() || !description.trim()) {
      toast.error("Mohon lengkapi semua field");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        listing_id: listingId,
        contract_id: contractId,
        title: title.trim(),
        category,
        priority,
        description: description.trim(),
      };
      await jsonFetch(`${urls.tickets}/tickets`, {
        method: "POST",
        headers: authHeaders(urls.ticketsToken),
        body: JSON.stringify(payload),
      });
      toast.success("Tiket keluhan berhasil dikirim");
      setTitle("");
      setDescription("");
      await refreshAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim tiket";
      toast.error(`Gagal: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-right" />
      <header className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Pengajuan Keluhan Tiket Tenant
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Tabs defaultValue="submit" className="w-full">
          <TabsList>
            <TabsTrigger value="submit">Ajukan Tiket</TabsTrigger>
            <TabsTrigger value="history">Riwayat Tiket</TabsTrigger>
            <TabsTrigger value="config">Konfigurasi API</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Keluhan Tenant</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitTicket} className="grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="listing">Unit Properti</Label>
                      <Input
                        id="listing"
                        value={listingId}
                        onChange={(e) => setListingId(e.target.value)}
                        placeholder="BLOK A8"
                        maxLength={150}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contract">Kontrak Sewa</Label>
                      <Input
                        id="contract"
                        value={contractId}
                        onChange={(e) => setContractId(e.target.value)}
                        placeholder="123123"
                        maxLength={150}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="title">Judul Keluhan</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: AC tidak dingin"
                      maxLength={150}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Detail Kerusakan</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan kerusakan secara detail..."
                      rows={5}
                      maxLength={1000}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Backend akan melakukan cross-check ke service Listing &
                      Kontrak.
                    </p>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Mengirim..." : "Kirim Tiket"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Riwayat Tiket</CardTitle>
                  <CardDescription>
                    Daftar tiket yang tersimpan di Service Manajemen Tenant.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refreshAll()}
                  disabled={loadingTickets}
                >
                  {loadingTickets ? "Memuat..." : "Refresh"}
                </Button>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada tiket.
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {tickets.map((t) => (
                      <div
                        key={String(t.id)}
                        className="rounded-lg border bg-card p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {String(t.id ?? "")}
                              </span>
                            </div>
                            <h3 className="mt-1 truncate font-medium">
                              {String(t.title ?? "(tanpa judul)")}
                            </h3>
                            {t.description && (
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                {t.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {t.listing_id !== undefined && (
                                <span>Unit: #{String(t.listing_id)}</span>
                              )}
                              {t.contract_id !== undefined && (
                                <span>Kontrak: #{String(t.contract_id)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>URL Base Service</CardTitle>
                <CardDescription>
                  Sesuaikan dengan host masing-masing service Laravel Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    saveUrls({
                      tickets:
                        String(fd.get("tickets") || "").trim() ||
                        DEFAULTS.tickets,
                      listings:
                        String(fd.get("listings") || "").trim() ||
                        DEFAULTS.listings,
                      contracts:
                        String(fd.get("contracts") || "").trim() ||
                        DEFAULTS.contracts,
                      ticketsToken: String(fd.get("ticketsToken") || "").trim(),
                    });
                  }}
                >
                  <div className="grid gap-2">
                    <Label htmlFor="u-tickets">
                      Service Manajemen Tiket (Dawai)
                    </Label>
                    <Input
                      id="u-tickets"
                      name="tickets"
                      defaultValue={urls.tickets}
                      placeholder="http://localhost:8002/api/v1/ticket-service/"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="u-tickets-token">
                      Bearer Token (Service Tiket)
                    </Label>
                    <Input
                      id="u-tickets-token"
                      name="ticketsToken"
                      type="password"
                      defaultValue={urls.ticketsToken}
                      placeholder="eyJhbGciOi..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="u-listings">
                      Service Listing Unit (Rafsan)
                    </Label>
                    <Input
                      id="u-listings"
                      name="listings"
                      defaultValue={urls.listings}
                      placeholder="http://localhost:8001/api/v1/listing-service/"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="u-contracts">
                      Service Kontrak Sewa (Akhdan)
                    </Label>
                    <Input
                      id="u-contracts"
                      name="contracts"
                      defaultValue={urls.contracts}
                      placeholder="http://localhost:8002/api/v1/contract-service/"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
