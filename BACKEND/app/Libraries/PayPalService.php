<?php

namespace App\Libraries;

class PayPalService
{
    private string $baseUrl;
    private string $clientId;
    private string $clientSecret;

    public function __construct()
    {
        $mode = strtolower((string) env('PAYPAL_MODE', 'sandbox'));

        $this->baseUrl = $mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';

        $this->clientId = (string) env('PAYPAL_CLIENT_ID');
        $this->clientSecret = (string) env('PAYPAL_CLIENT_SECRET');

        if ($this->clientId === '' || $this->clientSecret === '') {
            throw new \RuntimeException(
                'PayPal API credentials are missing from the environment configuration.'
            );
        }
    }

    /**
     * Get PayPal OAuth access token.
     */
    private function getAccessToken(): string
    {
        $ch = curl_init($this->baseUrl . '/v1/oauth2/token');

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_USERPWD => $this->clientId . ':' . $this->clientSecret,
            CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Accept-Language: en_US',
                'Content-Type: application/x-www-form-urlencoded',
            ],
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);

        curl_close($ch);

        if ($response === false || $curlError !== '') {
            throw new \RuntimeException(
                'Unable to connect to PayPal: ' . $curlError
            );
        }

        $data = json_decode($response, true);

        if ($httpCode !== 200 || empty($data['access_token'])) {
            throw new \RuntimeException(
                'PayPal authentication failed. HTTP ' . $httpCode
            );
        }

        return $data['access_token'];
    }

    /**
     * Send an authenticated request to PayPal.
     */
    private function request(
        string $method,
        string $endpoint,
        ?array $payload = null
    ): array {
        $token = $this->getAccessToken();

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ];

        $ch = curl_init($this->baseUrl . $endpoint);

        $options = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => strtoupper($method),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
        ];

        if ($payload !== null) {
            $options[CURLOPT_POSTFIELDS] = json_encode($payload);
        }

        curl_setopt_array($ch, $options);

        $response = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);

        curl_close($ch);

        if ($response === false || $curlError !== '') {
            throw new \RuntimeException(
                'PayPal request failed: ' . $curlError
            );
        }

        $data = json_decode($response, true);

        if (!is_array($data)) {
            throw new \RuntimeException(
                'PayPal returned an invalid response.'
            );
        }

        if ($httpCode < 200 || $httpCode >= 300) {
            log_message(
                'error',
                'PayPal API error: ' . json_encode($data)
            );

            throw new \RuntimeException(
                'PayPal API request failed. HTTP ' . $httpCode
            );
        }

        return $data;
    }

    /**
     * Create a PayPal checkout order.
     */
    public function createOrder(
        float $amount,
        string $reference
    ): array {
        return $this->request('POST', '/v2/checkout/orders', [
            'intent' => 'CAPTURE',

            'purchase_units' => [[
                'reference_id' => $reference,
                'custom_id' => $reference,
                'description' => '3TravelGo Bus Reservation',
                'amount' => [
                    'currency_code' => 'PHP',
                    'value' => number_format($amount, 2, '.', ''),
                ],
            ]],

            'payment_source' => [
                'paypal' => [
                    'experience_context' => [
                        'brand_name' => '3TravelGo',
                        'user_action' => 'PAY_NOW',
                        'return_url' => site_url('payment/paypal/success'),
                        'cancel_url' => site_url('payment/paypal/cancel'),
                    ],
                ],
            ],
        ]);
    }

    /**
     * Capture an approved PayPal order.
     */
    public function captureOrder(string $orderId): array
    {
        return $this->request(
            'POST',
            '/v2/checkout/orders/' . rawurlencode($orderId) . '/capture',
            []
        );
    }
}