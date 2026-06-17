<?php

namespace App\OpenApi;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Listing Unit Service API",
 *     version="1.0.0",
 *     description="IAE Assignment 2 service for managing property listing units."
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8001",
 *     description="Local Docker server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="IaeApiKey",
 *     type="apiKey",
 *     in="header",
 *     name="X-IAE-KEY",
 *     description="Use service owner NIM: 102022400128"
 * )
 *
 * @OA\Schema(
 *     schema="Listing",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="unit_code", type="string", example="APT-A-0501"),
 *     @OA\Property(property="unit_name", type="string", example="Apartemen Tower A 501"),
 *     @OA\Property(property="tower", type="string", example="A"),
 *     @OA\Property(property="floor", type="integer", example=5),
 *     @OA\Property(property="room_number", type="string", example="501"),
 *     @OA\Property(property="unit_type", type="string", example="apartment"),
 *     @OA\Property(property="status", type="string", enum={"available", "occupied", "maintenance"}, example="occupied"),
 *     @OA\Property(property="tenant_name", type="string", nullable=true, example="Budi Santoso"),
 *     @OA\Property(property="tenant_phone", type="string", nullable=true, example="081234567890"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 *
 * @OA\Schema(
 *     schema="StoreListingRequest",
 *     required={"unit_code", "unit_name", "tower", "floor", "room_number", "unit_type", "status"},
 *     @OA\Property(property="unit_code", type="string", example="APT-C-0910"),
 *     @OA\Property(property="unit_name", type="string", example="Apartemen Tower C 910"),
 *     @OA\Property(property="tower", type="string", example="C"),
 *     @OA\Property(property="floor", type="integer", example=9),
 *     @OA\Property(property="room_number", type="string", example="910"),
 *     @OA\Property(property="unit_type", type="string", example="apartment"),
 *     @OA\Property(property="status", type="string", enum={"available", "occupied", "maintenance"}, example="occupied"),
 *     @OA\Property(property="tenant_name", type="string", nullable=true, example="Rina Wijaya"),
 *     @OA\Property(property="tenant_phone", type="string", nullable=true, example="081298765432")
 * )
 *
 * @OA\Schema(
 *     schema="SuccessResponse",
 *     @OA\Property(property="status", type="string", example="success"),
 *     @OA\Property(property="message", type="string", example="Operation successful"),
 *     @OA\Property(property="data", type="object"),
 *     @OA\Property(
 *         property="meta",
 *         type="object",
 *         @OA\Property(property="service_name", type="string", example="Listing-Unit-Service"),
 *         @OA\Property(property="api_version", type="string", example="v1")
 *     )
 * )
 *
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     @OA\Property(property="status", type="string", example="error"),
 *     @OA\Property(property="message", type="string", example="Detail pesan kesalahan..."),
 *     @OA\Property(property="errors", nullable=true)
 * )
 */
class OpenApiSpec
{
}
