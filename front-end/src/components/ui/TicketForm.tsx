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

import type { Contract, Listing } from "@/types";

type Props = {
  ticketUrl: string;
  token: string;
  listings?: Listing[];
  contracts?: Contract[];
  onSuccess: () => Promise<void>;
};

export default function TicketForm({
  ticketUrl,
  token,
  listings = [],
  contracts = [],
  onSuccess,
}: Props) {
  const [listingId, setListingId] = useState("");
  const [contractId, setContractId] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const submitTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!listingId || !contractId || !description.trim()) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    try {
      setSubmitting(true);

      await ApiService.createTicket(ticketUrl, token, {
        listing_id: Number(listingId),
        contract_id: Number(contractId),
        tenant_name: "Test",
        tenant_email: "test@example.com",
        description: description.trim(),
      });

      toast.success("Tiket keluhan berhasil dikirim");

      setListingId("");
      setContractId("");
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
        <div className="grid gap-2">
          <Label>Unit Properti</Label>

          <Select value={listingId} onValueChange={setListingId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Unit Properti" />
            </SelectTrigger>

            <SelectContent>
              {listings.length === 0 ? (
                <SelectItem value="empty-listing" disabled>
                  Tidak ada data listing
                </SelectItem>
              ) : (
                listings.map((listing) => (
                  <SelectItem
                    key={String(listing.id)}
                    value={String(listing.id)}
                  >
                    {listing.name ?? `Listing #${listing.id}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Kontrak Sewa</Label>

          <Select value={contractId} onValueChange={setContractId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kontrak Sewa" />
            </SelectTrigger>

            <SelectContent>
              {contracts.length === 0 ? (
                <SelectItem value="empty-contract" disabled>
                  Tidak ada data kontrak
                </SelectItem>
              ) : (
                contracts.map((contract) => (
                  <SelectItem
                    key={String(contract.id)}
                    value={String(contract.id)}
                  >
                    {contract.tenant_name
                      ? `${contract.tenant_name} (#${contract.id})`
                      : `Contract #${contract.id}`}
                  </SelectItem>
                ))
              )}
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
