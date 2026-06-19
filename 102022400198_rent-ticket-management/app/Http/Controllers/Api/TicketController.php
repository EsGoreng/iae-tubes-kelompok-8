<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\RabbitMQService;
use App\Services\SoapAuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
 
class TicketController extends Controller
{
    public function __construct(
        private SoapAuditService $soapService,
        private RabbitMQService $rabbitService
    ) {}
 
    // GET /api/v1/tickets
    public function index()
    {
        $tickets = Ticket::all();
        return response()->json([
            'success' => true,
            'data'    => $tickets,
        ]);
    }
 
    // GET /api/v1/tickets/{id}
    public function show($id)
    {
        $ticket = Ticket::findOrFail($id);
        return response()->json([
            'success' => true,
            'data'    => $ticket,
        ]);
    }
 
    // POST /api/v1/tickets
    public function store(Request $request)
    {
        $request->validate([
            'listing_id'   => 'required|int',
            'contract_id'  => 'required|int',
            'tenant_name'  => 'required|string',
            'description'  => 'required|string',
        ]);
 
        // STEP 1 & 2: Cross-check Service Listing & Kontrak
        // TODO: Aktifkan setelah service teman siap

        //Listing
        $listingResponse  = Http::get(env('LISTING_SERVICE_URL') . "/api/v1/listings/{$request->listing_id}");

        if ($listingResponse->status() === 404) {
            return response()->json([
                'success' => false,
                'message' => 'Listing tidak ditemukan'
            ], 404);
        }

        if (! $listingResponse->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data listing service',
                'error' => $listingResponse->json()
            ], $listingResponse->status());
        }

        $listing = $listingResponse->json();

        //Contract
        $contractResponse = Http::get(env('CONTRACT_SERVICE_URL') . "/api/v1/contracts/{$request->contract_id}");
 
        if (! $contractResponse->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Contract tidak ditemukan'
            ], 404);
        }

        if (! $contractResponse->successful()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data Contract Service',
                'error' => $contractResponse->json()
            ], $contractResponse->status());
        }

        $contract = $contractResponse->json();
        // =============================================
        // STEP 3: Simpan tiket ke database
        // =============================================
        $ticket = Ticket::create([
            'listing_id'   => $request->listing_id,
            'contract_id'  => $request->contract_id,
            'tenant_name'  => $request->tenant_name,
            'tenant_email' => $request->tenant_email,
            'description'  => $request->description,
            'status'       => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ticket berhasil dibuat',
            'data' => [
                'ticket'   => $ticket,
                'listing'  => $listing,
                'contract' => $contract,
            ]
        ], 201);

 
        // =============================================
        // STEP 4: Kirim SOAP Audit pakai M2M token
        // =============================================
        $receiptNumber = $this->soapService->sendAudit($ticket->toArray());
 
        if ($receiptNumber) {
            $ticket->update(['soap_receipt' => $receiptNumber]);
            $ticket->refresh();
        }
 
        // =============================================
        // STEP 5: Publish event ke RabbitMQ pakai M2M token
        // =============================================
        $this->rabbitService->publishTicketCreated($ticket->toArray());
 
        return response()->json([
            'success' => true,
            'message' => 'Tiket berhasil dibuat',
            'data'    => $ticket,
        ], 201);
    }
}
 