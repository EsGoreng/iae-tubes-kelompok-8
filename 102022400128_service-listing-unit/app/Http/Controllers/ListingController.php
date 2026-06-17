<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingRequest;
use App\Models\Listing;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class ListingController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/listings",
     *     operationId="getListings",
     *     tags={"Listings"},
     *     summary="Get all listing units",
     *     security={{"IaeApiKey":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Listing units retrieved successfully",
     *         @OA\JsonContent(ref="#/components/schemas/SuccessResponse")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid or missing API key",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $listings = Listing::query()
            ->latest('id')
            ->get();

        return ApiResponse::success($listings);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/listings/{id}",
     *     operationId="getListingById",
     *     tags={"Listings"},
     *     summary="Get one listing unit by id",
     *     security={{"IaeApiKey":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         example=1
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Listing unit retrieved successfully",
     *         @OA\JsonContent(ref="#/components/schemas/SuccessResponse")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid or missing API key",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Listing unit not found",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     */
    public function show(int $id): JsonResponse
    {
        $listing = Listing::query()->find($id);

        if (! $listing) {
            return ApiResponse::error('Listing unit not found', null, 404);
        }

        return ApiResponse::success($listing);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/listings",
     *     operationId="createListing",
     *     tags={"Listings"},
     *     summary="Create a new listing unit",
     *     security={{"IaeApiKey":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/StoreListingRequest")
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Listing unit created successfully",
     *         @OA\JsonContent(ref="#/components/schemas/SuccessResponse")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Invalid or missing API key",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation failed",
     *         @OA\JsonContent(ref="#/components/schemas/ErrorResponse")
     *     )
     * )
     */
    public function store(StoreListingRequest $request, \App\Services\IaeIntegrationService $integrationService): JsonResponse
    {
        $listing = Listing::query()->create($request->validated());

        // Modul 2: SOAP XML Client
        $receiptNumber = $integrationService->sendAuditLog('CreateListing', $listing->toArray());
        if ($receiptNumber) {
            $listing->update(['receipt_number' => $receiptNumber]);
        }

        // Modul 3: AMQP Publisher
        $integrationService->publishEvent('listing.created', $listing->toArray());

        return ApiResponse::success($listing, 'Listing unit created successfully', 201);
    }
}
