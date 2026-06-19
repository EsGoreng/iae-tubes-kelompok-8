import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiService } from "@/services/api";

// Pastikan tipe Tenant diimport
import type { Contract, Listing, Tenant } from "@/types";

type Props = {
  ticketUrl: string;
  token: string;
  listings?: Listing[];
  contracts?: Contract[];
  tenants?: Tenant[]; // Tambahkan ini
  onSuccess: () => Promise<void>;
};

export default function TicketForm({
  ticketUrl,
  token,
  listings = [],
  contracts = [],
  tenants = [], // Tambahkan ini
  onSuccess,
}: Props) {
  const [listingId, setListingId] = useState("");
  const [tenantId, setTenantId] = useState(""); // Ubah dari contractId ke tenantId
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const submitTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!listingId || !tenantId || !description.trim()) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    // CARI KONTRAK YANG COCOK BERDASARKAN UNIT DAN TENANT
    const activeContract = contracts.find(
      (c) =>
        String(c.listing_id) === listingId && String(c.tenant_id) === tenantId,
    );

    if (!activeContract) {
      toast.error("Tidak ditemukan kontrak sewa untuk Unit dan Tenant ini.");
      return;
    }

    const selectedTenant = tenants.find((t) => String(t.id) === tenantId);

    try {
      setSubmitting(true);

      await ApiService.createTicket(ticketUrl, token, {
        listing_id: Number(listingId),
        contract_id: activeContract.id, // Gunakan ID kontrak yang ditemukan
        tenant_name: selectedTenant?.name || "Unknown",
        tenant_email: selectedTenant?.email || "unknown@example.com",
        description: description.trim(),
      });

      toast.success("Tiket keluhan berhasil dikirim");

      setListingId("");
      setTenantId("");
      setDescription("");

      await onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim tiket",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitTicket} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        {/* DROPDOWN UNIT PROPERTI */}
        <div className="grid gap-2">
          <Label>Unit Properti</Label>
          <Select value={listingId} onValueChange={setListingId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Unit Properti" />
            </SelectTrigger>
            <SelectContent>
              {listings.map((listing, index) => {
                // Gunakan index sebagai cadangan jika id null
                const safeId = listing.id
                  ? String(listing.id)
                  : `listing-fallback-${index}`;

                return (
                  <SelectItem key={safeId} value={safeId}>
                    {listing.name ?? `Listing #${listing.id || "Unknown"}`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* DROPDOWN TENANT */}
        <div className="grid gap-2">
          <Label>Nama Tenant</Label>
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Nama Tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant, index) => {
                // Gunakan index sebagai cadangan jika id null
                const safeId = tenant.id
                  ? String(tenant.id)
                  : `tenant-fallback-${index}`;

                return (
                  <SelectItem key={safeId} value={safeId}>
                    {tenant.name || "Unknown Tenant"}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
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
          Backend akan melakukan validasi ke service Listing dan Contract.
        </p>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Mengirim..." : "Kirim Tiket"}
        </Button>
      </div>
    </form>
  );
}
