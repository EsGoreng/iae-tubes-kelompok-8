import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DEFAULTS } from "@/hooks/useServiceUrls";

import type { ServiceUrls } from "@/types";

type Props = {
  urls: ServiceUrls;
  saveUrls: (urls: ServiceUrls) => void;
};

export default function ApiConfigForm({ urls, saveUrls }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    saveUrls({
      tickets: String(fd.get("tickets") || "").trim() || DEFAULTS.tickets,

      listings: String(fd.get("listings") || "").trim() || DEFAULTS.listings,

      contracts: String(fd.get("contracts") || "").trim() || DEFAULTS.contracts,

      ticketsToken: String(fd.get("ticketsToken") || "").trim(),
    });
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="u-tickets">Service Manajemen Tiket (Dawai)</Label>

        <Input
          id="u-tickets"
          name="tickets"
          defaultValue={urls.tickets}
          placeholder="http://localhost:8002/api/v1/ticket-service"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="u-tickets-token">Bearer Token (Service Tiket)</Label>

        <Input
          id="u-tickets-token"
          name="ticketsToken"
          type="password"
          defaultValue={urls.ticketsToken}
          placeholder="eyJhbGciOi..."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="u-listings">Service Listing Unit (Rafsan)</Label>

        <Input
          id="u-listings"
          name="listings"
          defaultValue={urls.listings}
          placeholder="http://localhost:8001/api/v1/listing-service"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="u-contracts">Service Kontrak Sewa (Akhdan)</Label>

        <Input
          id="u-contracts"
          name="contracts"
          defaultValue={urls.contracts}
          placeholder="http://localhost:8000/api/v1/contract-service"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Simpan Konfigurasi</Button>
      </div>
    </form>
  );
}
