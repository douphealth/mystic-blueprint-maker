<?php
/**
 * Plugin Name: MysticalDigits Verified Purchases (v2)
 * Description: Stripe-verified checkout, browser entitlement and email-code restoration for the MysticalDigits Blueprint.
 * Version: 0.1.0
 * Requires PHP: 8.0
 */
if (!defined('ABSPATH')) {
    exit;
}

/*
 * Required wp-config.php constants (never commit actual keys):
 * MDX2_STRIPE_RESTRICTED_KEY — Stripe restricted key with Checkout Sessions
 * read/write, Prices read, Payment Intents and Charges read.
 * MDX2_PREMIUM_PRICE_ID — price for the Premium Blueprint, from the SAME account.
 * MDX2_STRIPE_WEBHOOK_SECRET — signing secret for /wp-json/mdx/v2/stripe-webhook.
 *
 * Install AFTER staging and validating the Stripe account, price and webhook.
 * The legacy /mdx/v1 routes are intentionally left untouched.
 */
const MDX2_ORIGIN = 'https://life-path.mysticaldigits.com';
const MDX2_COOKIE = 'mdx2_verified_purchase';
const MDX2_COOKIE_MAX_AGE = 604800; // 7 days

function mdx2_setting(string $name): string {
    return defined($name) ? (string) constant($name) : '';
}

function mdx2_origin_allowed(WP_REST_Request $req) {
    $origin = $req->get_header('origin');
    if ($origin !== MDX2_ORIGIN) {
        return new WP_Error('mdx_origin_forbidden', 'This application origin is not authorized.', ['status' => 403]);
    }
    return true;
}

add_filter('rest_pre_serve_request', static function ($served) {
    $path = (string) ($_SERVER['REQUEST_URI'] ?? '');
    if (strpos($path, '/mdx/v2/') === false) {
        return $served;
    }
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin === MDX2_ORIGIN) {
        header('Access-Control-Allow-Origin: ' . MDX2_ORIGIN);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Vary: Origin', false);
    }
    header('Cache-Control: private, no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    return $served;
}, 20);

add_action('rest_api_init', static function () {
    $routes = [
        '/create-payment' => 'mdx2_create_payment',
        '/verify-entitlement' => 'mdx2_verify_entitlement',
        '/request-restore' => 'mdx2_request_restore',
        '/complete-restore' => 'mdx2_complete_restore',
        '/stripe-webhook' => 'mdx2_stripe_webhook',
    ];
    foreach ($routes as $route => $callback) {
        register_rest_route('mdx/v2', $route, [
            'methods' => 'POST',
            'callback' => $callback,
            'permission_callback' => '__return_true',
        ]);
    }
});

function mdx2_stripe(string $method, string $path, array $params = []) {
    $key = mdx2_setting('MDX2_STRIPE_RESTRICTED_KEY');
    if (!$key || !str_starts_with($path, '/')) {
        return new WP_Error('mdx_not_configured', 'Payment verification is not configured.', ['status' => 503]);
    }
    $url = 'https://api.stripe.com/v1' . $path;
    $body = http_build_query($params, '', '&', PHP_QUERY_RFC3986);
    if ($method === 'GET' && $body !== '') {
        $url .= '?' . $body;
    }
    $args = [
        'method' => $method,
        'timeout' => 15,
        'redirection' => 0,
        'sslverify' => true,
        'headers' => [
            'Authorization' => 'Bearer ' . $key,
            'Content-Type' => 'application/x-www-form-urlencoded',
        ],
    ];
    if ($method === 'POST') {
        $args['body'] = $body;
    }
    $res = wp_remote_request($url, $args);
    if (is_wp_error($res)) {
        return new WP_Error('mdx_stripe_unavailable', 'The payment provider is temporarily unavailable.', ['status' => 503]);
    }
    $status = (int) wp_remote_retrieve_response_code($res);
    $json = json_decode((string) wp_remote_retrieve_body($res), true);
    if ($status < 200 || $status >= 300 || !is_array($json)) {
        return new WP_Error('mdx_stripe_failure', 'Payment verification could not be completed.', ['status' => 503]);
    }
    return $json;
}

function mdx2_valid_session_id(string $id): bool {
    return (bool) preg_match('/^cs_(?:live|test)_[A-Za-z0-9]{10,200}$/D', $id);
}

function mdx2_verified_session(string $session_id) {
    if (!mdx2_valid_session_id($session_id)) {
        return new WP_Error('mdx_bad_session', 'Invalid Checkout Session.', ['status' => 400]);
    }
    $price_id = mdx2_setting('MDX2_PREMIUM_PRICE_ID');
    if (!$price_id) {
        return new WP_Error('mdx_not_configured', 'Premium price is not configured.', ['status' => 503]);
    }
    $session = mdx2_stripe('GET', '/checkout/sessions/' . rawurlencode($session_id), [
        'expand[0]' => 'payment_intent.latest_charge',
    ]);
    if (is_wp_error($session)) {
        return $session;
    }
    if (($session['mode'] ?? '') !== 'payment'
        || ($session['status'] ?? '') !== 'complete'
        || ($session['payment_status'] ?? '') !== 'paid') {
        return new WP_Error('mdx_unpaid', 'Payment not completed.', ['status' => 402]);
    }
    $items = mdx2_stripe('GET', '/checkout/sessions/' . rawurlencode($session_id) . '/line_items', [
        'limit' => '100',
    ]);
    if (is_wp_error($items)) {
        return $items;
    }
    $correct_product = false;
    foreach (($items['data'] ?? []) as $item) {
        if (($item['price']['id'] ?? '') === $price_id && (int) ($item['quantity'] ?? 0) >= 1) {
            $correct_product = true;
            break;
        }
    }
    if (!$correct_product) {
        return new WP_Error('mdx_wrong_product', 'The checkout is not for this product.', ['status' => 403]);
    }
    $payment_intent = $session['payment_intent'] ?? null;
    if (!is_array($payment_intent)) {
        return new WP_Error('mdx_refund_check_unavailable', 'Payment status could not be fully verified.', ['status' => 503]);
    }
    $charge = $payment_intent['latest_charge'] ?? null;
    if (!is_array($charge)) {
        return new WP_Error('mdx_refund_check_unavailable', 'Refund status could not be verified.', ['status' => 503]);
    }
    if (!empty($charge['refunded']) || !empty($charge['disputed'])
        || ((int) ($charge['amount'] ?? 0) > 0
            && (int) ($charge['amount_refunded'] ?? 0) >= (int) $charge['amount'])) {
        return new WP_Error('mdx_revoked', 'This purchase is no longer active.', ['status' => 403]);
    }
    return $session;
}

function mdx2_cookie_from_session(string $sid): void {
    $expires = time() + MDX2_COOKIE_MAX_AGE;
    $payload = rtrim(strtr(base64_encode(wp_json_encode(['sid' => $sid, 'exp' => $expires])), '+/', '-_'), '=');
    $signature = hash_hmac('sha256', $payload, wp_salt('auth'));
    setcookie(MDX2_COOKIE, $payload . '.' . $signature, [
        'expires' => $expires,
        'path' => '/',
        'domain' => '.mysticaldigits.com',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function mdx2_cookie_session(): ?string {
    $value = (string) ($_COOKIE[MDX2_COOKIE] ?? '');
    $parts = explode('.', $value);
    if (count($parts) !== 2 || !hash_equals(hash_hmac('sha256', $parts[0], wp_salt('auth')), $parts[1])) {
        return null;
    }
    $json = base64_decode(strtr($parts[0], '-_', '+/'), true);
    $data = is_string($json) ? json_decode($json, true) : null;
    if (!is_array($data) || (int) ($data['exp'] ?? 0) < time()) {
        return null;
    }
    $id = (string) ($data['sid'] ?? '');
    return mdx2_valid_session_id($id) ? $id : null;
}

function mdx2_purchased_response(array $session): WP_REST_Response {
    mdx2_cookie_from_session((string) $session['id']);
    return new WP_REST_Response([
        'entitled' => true,
        'verified' => true,
        'email' => sanitize_email((string) ($session['customer_details']['email'] ?? $session['customer_email'] ?? '')),
    ], 200);
}

function mdx2_verify_entitlement(WP_REST_Request $req) {
    $allowed = mdx2_origin_allowed($req);
    if (is_wp_error($allowed)) return $allowed;
    $supplied = (string) $req->get_param('session_id');
    // Never accept an email address, redirect marker or browser flag as proof.
    $session_id = $supplied !== '' ? $supplied : mdx2_cookie_session();
    if (!$session_id) {
        return new WP_REST_Response(['entitled' => false, 'verified' => false, 'reason' => 'not_authenticated'], 200);
    }
    $session = mdx2_verified_session($session_id);
    if (is_wp_error($session)) {
        if (in_array($session->get_error_code(), ['mdx_bad_session', 'mdx_unpaid', 'mdx_wrong_product', 'mdx_revoked'], true)) {
            return new WP_REST_Response(['entitled' => false, 'verified' => false, 'reason' => 'not_entitled'], 200);
        }
        return $session;
    }
    return mdx2_purchased_response($session);
}

function mdx2_create_payment(WP_REST_Request $req) {
    $allowed = mdx2_origin_allowed($req);
    if (is_wp_error($allowed)) return $allowed;
    $price_id = mdx2_setting('MDX2_PREMIUM_PRICE_ID');
    if (!$price_id) return new WP_Error('mdx_not_configured', 'Premium checkout is not configured.', ['status' => 503]);
    $email = strtolower(trim((string) $req->get_param('email')));
    if ($email && !is_email($email)) {
        return new WP_Error('mdx_invalid_email', 'Invalid email.', ['status' => 400]);
    }
    $args = [
        'mode' => 'payment',
        'line_items[0][price]' => $price_id,
        'line_items[0][quantity]' => 1,
        'success_url' => MDX2_ORIGIN . '/payment-success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => MDX2_ORIGIN . '/payment-canceled',
        'client_reference_id' => 'mdx_premium_blueprint',
        'metadata[app]' => 'mysticaldigits-blueprint',
        'payment_intent_data[metadata][app]' => 'mysticaldigits-blueprint',
    ];
    if ($email) $args['customer_email'] = $email;
    $session = mdx2_stripe('POST', '/checkout/sessions', $args);
    if (is_wp_error($session)) return $session;
    $url = (string) ($session['url'] ?? '');
    if (!str_starts_with($url, 'https://checkout.stripe.com/')) {
        return new WP_Error('mdx_bad_checkout_url', 'Stripe did not return a safe checkout URL.', ['status' => 503]);
    }
    return new WP_REST_Response(['url' => $url, 'mode' => 'checkout'], 200);
}

function mdx2_restore_key(string $email, string $ip): string {
    return 'mdx2_limit_' . substr(hash_hmac('sha256', strtolower($email) . '|' . $ip, wp_salt('auth')), 0, 32);
}

function mdx2_request_rate(string $key, int $max, int $ttl): bool {
    $count = (int) get_transient($key);
    if ($count >= $max) return false;
    set_transient($key, $count + 1, $ttl);
    return true;
}

function mdx2_purchase_for_email(string $email) {
    // Stripe Checkout Sessions cannot be listed with a customer_details[email]
    // filter. Locate verified Customers by email, then inspect their Sessions.
    // Never turn a Stripe API error into a false "no purchase" result.
    $customers = mdx2_stripe('GET', '/customers', [
        'email' => $email,
        'limit' => 100,
    ]);
    if (is_wp_error($customers)) return $customers;
    foreach (($customers['data'] ?? []) as $customer) {
        $customer_id = (string) ($customer['id'] ?? '');
        if (!preg_match('/^cus_[A-Za-z0-9]+$/D', $customer_id)) continue;
        $cursor = '';
        for ($page = 0; $page < 10; $page++) {
            $params = ['customer' => $customer_id, 'limit' => 100];
            if ($cursor !== '') $params['starting_after'] = $cursor;
            $sessions = mdx2_stripe('GET', '/checkout/sessions', $params);
            if (is_wp_error($sessions)) return $sessions;
            foreach (($sessions['data'] ?? []) as $session) {
                $sid = (string) ($session['id'] ?? '');
                if (!mdx2_valid_session_id($sid)) continue;
                $found = mdx2_verified_session($sid);
                if (is_wp_error($found)) continue;
                $buyer = strtolower((string) ($found['customer_details']['email'] ?? $found['customer_email'] ?? ''));
                if (hash_equals($email, $buyer)) return $found;
            }
            $data = $sessions['data'] ?? [];
            if (empty($sessions['has_more']) || !$data) break;
            $cursor = (string) end($data)['id'];
        }
    }
    return null;
}

function mdx2_request_restore(WP_REST_Request $req) {
    $allowed = mdx2_origin_allowed($req);
    if (is_wp_error($allowed)) return $allowed;
    $email = strtolower(trim((string) $req->get_param('email')));
    if (!is_email($email)) {
        return new WP_Error('mdx_invalid_email', 'Enter a valid email address.', ['status' => 400]);
    }
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    if (!mdx2_request_rate(mdx2_restore_key($email, $ip), 3, HOUR_IN_SECONDS)
        || !mdx2_request_rate('mdx2_ip_' . substr(hash('sha256', $ip), 0, 32), 20, HOUR_IN_SECONDS)) {
        return new WP_Error('mdx_rate_limited', 'Too many requests. Try again later.', ['status' => 429]);
    }
    $challenge = bin2hex(random_bytes(16));
    $code = (string) random_int(10000000, 99999999);
    $session = mdx2_purchase_for_email($email);
    if (is_wp_error($session)) return $session;
    // The same response is returned whether a paid account exists or not.
    $sid = is_array($session) ? (string) $session['id'] : '';
    set_transient('mdx2_otp_' . $challenge, [
        'sid' => $sid,
        'email' => $email,
        'hash' => hash_hmac('sha256', $challenge . ':' . $code, wp_salt('auth')),
        'attempts' => 0,
    ], 10 * MINUTE_IN_SECONDS);
    if ($sid !== '') {
        wp_mail($email, 'Your MysticalDigits purchase verification code',
            "Your purchase verification code is: {$code}\n\nIt expires in 10 minutes. If you did not request it, you can ignore this email.");
    }
    return new WP_REST_Response(['request_id' => $challenge, 'message' => 'If a qualifying purchase exists, a code has been sent.'], 200);
}

function mdx2_complete_restore(WP_REST_Request $req) {
    $allowed = mdx2_origin_allowed($req);
    if (is_wp_error($allowed)) return $allowed;
    $challenge = (string) $req->get_param('request_id');
    $code = (string) $req->get_param('code');
    if (!preg_match('/^[a-f0-9]{32}$/D', $challenge) || !preg_match('/^[0-9]{8}$/D', $code)) {
        return new WP_Error('mdx_invalid_code', 'Invalid or expired code.', ['status' => 400]);
    }
    $key = 'mdx2_otp_' . $challenge;
    $saved = get_transient($key);
    if (!is_array($saved) || (int) ($saved['attempts'] ?? 0) >= 5) {
        return new WP_Error('mdx_expired_code', 'Invalid or expired code.', ['status' => 403]);
    }
    $saved['attempts'] = (int) $saved['attempts'] + 1;
    set_transient($key, $saved, 10 * MINUTE_IN_SECONDS);
    $expected = hash_hmac('sha256', $challenge . ':' . $code, wp_salt('auth'));
    if (!hash_equals((string) ($saved['hash'] ?? ''), $expected) || empty($saved['sid'])) {
        return new WP_Error('mdx_invalid_code', 'Invalid or expired code.', ['status' => 403]);
    }
    $session = mdx2_verified_session((string) $saved['sid']);
    if (is_wp_error($session)) return $session;
    $actual_email = strtolower((string) ($session['customer_details']['email'] ?? $session['customer_email'] ?? ''));
    if (!hash_equals((string) $saved['email'], $actual_email)) {
        return new WP_Error('mdx_wrong_buyer', 'Purchase identity mismatch.', ['status' => 403]);
    }
    delete_transient($key);
    return mdx2_purchased_response($session);
}

function mdx2_stripe_webhook(WP_REST_Request $req) {
    $secret = mdx2_setting('MDX2_STRIPE_WEBHOOK_SECRET');
    if (!$secret) return new WP_Error('mdx_webhook_not_configured', 'Webhook is not configured.', ['status' => 503]);
    $header = (string) $req->get_header('stripe-signature');
    $raw = (string) $req->get_body();
    $stamp = 0;
    $sigs = [];
    foreach (explode(',', $header) as $part) {
        $pieces = explode('=', trim($part), 2);
        if (count($pieces) !== 2) continue;
        if ($pieces[0] === 't') $stamp = (int) $pieces[1];
        if ($pieces[0] === 'v1') $sigs[] = $pieces[1];
    }
    if (!$stamp || abs(time() - $stamp) > 300) {
        return new WP_Error('mdx_invalid_signature', 'Invalid signature.', ['status' => 400]);
    }
    $expected = hash_hmac('sha256', $stamp . '.' . $raw, $secret);
    $valid = false;
    foreach ($sigs as $sig) if (hash_equals($expected, $sig)) $valid = true;
    if (!$valid) return new WP_Error('mdx_invalid_signature', 'Invalid signature.', ['status' => 400]);
    $event = json_decode($raw, true);
    if (!is_array($event) || !isset($event['id'], $event['type'])) {
        return new WP_Error('mdx_invalid_event', 'Malformed event.', ['status' => 400]);
    }
    $event_id = (string) $event['id'];
    $event_key = 'mdx2_evt_' . substr(hash('sha256', $event_id), 0, 40);
    if (get_option($event_key) !== false) return new WP_REST_Response(['received' => true], 200);
    $type = (string) $event['type'];
    if (in_array($type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
        $sid = (string) ($event['data']['object']['id'] ?? '');
        if (mdx2_valid_session_id($sid)) {
            $session = mdx2_verified_session($sid);
            if (is_wp_error($session)) {
                if (!in_array($session->get_error_code(), ['mdx_unpaid', 'mdx_wrong_product'], true)) return $session;
            } else {
                update_option('mdx2_order_' . substr(hash('sha256', $sid), 0, 40), [
                    'session_id' => $sid,
                    'payment_intent' => (string) ($session['payment_intent']['id'] ?? ''),
                    'created_at' => time(),
                ], false);
            }
        }
    }
    // Entitlements are checked against Stripe on every use; refunds and disputes
    // therefore invalidate access without trusting an asynchronous local flag.
    add_option($event_key, $type, '', false);
    return new WP_REST_Response(['received' => true], 200);
}
