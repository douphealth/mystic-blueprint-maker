/**
 * MDX Premium Entitlement — drop-in replacement for the deleted Supabase project.
 *
 * WHY THIS EXISTS
 * ---------------
 * The Blueprint app at https://blueprint.mysticaldigits.com/ calls two Supabase
 * edge functions: `verify-entitlement` and `create-payment`. The Supabase project
 * those pointed at (pqrnobnniqfxysztjrgo.supabase.co) no longer exists — DNS
 * returns NXDOMAIN. As a result:
 *   - verifySession() can never confirm a real purchase server-side
 *   - verifyEmail()  can never restore access for a returning buyer
 *   - create-payment falls through to the static Stripe link (which still works)
 *
 * This snippet serves those same two contracts from WordPress, so the app needs
 * no rebuild. It is additive: nothing here removes or overrides an existing hook.
 *
 * CONTRACTS IMPLEMENTED (match the bundled client exactly)
 *   POST /wp-json/mdx/v1/verify-entitlement
 *        body {session_id?: string, email?: string}
 *        -> {entitled: bool, email?: string, reason?: string}
 *   POST /wp-json/mdx/v1/create-payment
 *        body {email?: string}
 *        -> {url: string}
 *
 * STRIPE
 * ------
 * Payment itself continues to use the existing live Stripe Payment Link
 * (buy.stripe.com/4gM4gz75C4CI1g9bn8ejK03, $7.99). This snippet does not change
 * pricing or the checkout experience.
 *
 * Entitlement is granted two ways:
 *   1. A Stripe webhook (checkout.session.completed) writes a durable
 *      entitlement row keyed by session id + email.  <-- authoritative
 *   2. A one-time migration of known paid buyers, listed in MDX_ENTITLED_SEED.
 *
 * Since 2026-11-22 the payment link redirects to
 * /payment-success?session_id={CHECKOUT_SESSION_ID}, the webhook is registered,
 * and the app unlocks only when verify-entitlement confirms that session id.
 *
 * SAFETY: read/write is limited to entitlement rows. No existing option, post,
 * user or setting is modified or deleted.
 */

if (!defined('ABSPATH')) { exit; }

/* ------------------------------------------------------------------ config --- */

if (!defined('MDX_ENT_TABLE')) {
    define('MDX_ENT_TABLE', $GLOBALS['wpdb']->prefix . 'mdx_entitlements');
}

if (!defined('MDX_STRIPE_LINK')) {
    define('MDX_STRIPE_LINK', 'https://buy.stripe.com/4gM4gz75C4CI1g9bn8ejK03');
}

/**
 * Stripe webhook signing secret (whsec_...). Fill this in from
 * Stripe Dashboard -> Developers -> Webhooks, then entitlement becomes
 * server-verified. Leave empty to run on redirect-trust + restore-by-email.
 */
if (!defined('MDX_STRIPE_WH_SECRET')) {
    define('MDX_STRIPE_WH_SECRET', '__WHSEC__');
}

/**
 * The Stripe account is shared with other sites, so the webhook receives their
 * checkouts too. Only sessions created by this payment link grant Blueprint
 * Premium (2026-11-22).
 */
/**
 * Restricted Stripe key with ONLY "Checkout Sessions: write" (2026-11-22).
 * create-payment uses it to open a Checkout Session branded "Mystical Digits",
 * because the Stripe account (shared with other sites) is named after its
 * owner. Empty or failing -> falls back to the static payment link.
 */
if (!defined('MDX_STRIPE_CHECKOUT_KEY')) {
    define('MDX_STRIPE_CHECKOUT_KEY', '__CHECKOUT_KEY__');
}
if (!defined('MDX_STRIPE_PRICE')) {
    define('MDX_STRIPE_PRICE', 'price_1THmEhGCqwm95OGXkduBlzY4');
}
if (!defined('MDX_STRIPE_APP')) {
    define('MDX_STRIPE_APP', 'mystic-blueprint');
}

/** Create a branded Checkout Session. Returns its URL, or '' on any failure. */
function mdx_ent_checkout_session_url($email) {
    if (!MDX_STRIPE_CHECKOUT_KEY || strpos(MDX_STRIPE_CHECKOUT_KEY, 'rk_live_') !== 0) { return ''; }
    $body = array(
        'mode'                       => 'payment',
        'line_items[0][price]'       => MDX_STRIPE_PRICE,
        'line_items[0][quantity]'    => 1,
        'success_url'                => 'https://blueprint.mysticaldigits.com/payment-success?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url'                 => 'https://blueprint.mysticaldigits.com/payment-canceled',
        'branding_settings[display_name]' => 'Mystical Digits',
        'payment_intent_data[statement_descriptor_suffix]' => 'MYSTICALDG',
        'metadata[app]'              => MDX_STRIPE_APP,
    );
    if ($email !== '') { $body['customer_email'] = $email; }
    $res = wp_remote_post('https://api.stripe.com/v1/checkout/sessions', array(
        'timeout' => 8,
        'headers' => array('Authorization' => 'Bearer ' . MDX_STRIPE_CHECKOUT_KEY),
        'body'    => $body,
    ));
    if (is_wp_error($res) || (int) wp_remote_retrieve_response_code($res) !== 200) { return ''; }
    $json = json_decode(wp_remote_retrieve_body($res), true);
    $url  = is_array($json) ? (string) ($json['url'] ?? '') : '';
    return strpos($url, 'https://checkout.stripe.com/') === 0 ? $url : '';
}

if (!defined('MDX_STRIPE_PLINK')) {
    define('MDX_STRIPE_PLINK', 'plink_1UCvLgGCqwm95OGXCSUcwu2n');
}

/**
 * One-time seed of buyers who paid before this backend existed.
 * These get server-verified access immediately so nobody who already paid
 * has to rely on a browser flag. Add real buyer addresses here and re-save.
 */
if (!defined('MDX_ENTITLED_SEED')) {
    define('MDX_ENTITLED_SEED', array(
        // 'buyer@example.com',
    ));
}

/* ------------------------------------------------------------------ schema --- */

function mdx_ent_install() {
    global $wpdb;
    $table   = MDX_ENT_TABLE;
    $charset = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(190) NOT NULL DEFAULT '',
        session_id VARCHAR(190) NOT NULL DEFAULT '',
        amount_total INT NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'usd',
        status VARCHAR(32) NOT NULL DEFAULT 'active',
        source VARCHAR(32) NOT NULL DEFAULT 'stripe',
        created_at DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
        updated_at DATETIME NOT NULL DEFAULT '0000-00-00 00:00:00',
        PRIMARY KEY (id),
        KEY email (email),
        KEY session_id (session_id)
    ) {$charset};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);

    update_option('mdx_ent_schema', '1', false);
}
add_action('init', function () {
    if (get_option('mdx_ent_schema') !== '1') { mdx_ent_install(); }
}, 1);

/* --------------------------------------------------------------- data layer --- */

function mdx_ent_normalize_email($email) {
    $email = strtolower(trim((string) $email));
    return is_email($email) ? $email : '';
}

/** Grant (or refresh) an entitlement. Idempotent. */
function mdx_ent_grant($email, $session_id = '', $amount = 0, $currency = 'usd', $source = 'stripe') {
    global $wpdb;
    $email = mdx_ent_normalize_email($email);
    $session_id = substr(trim((string) $session_id), 0, 190);
    if ($email === '' && $session_id === '') { return false; }

    $table = MDX_ENT_TABLE;
    $now   = current_time('mysql');

    // Prefer matching on session id when we have one (strongest key).
    $existing = null;
    if ($session_id !== '') {
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE session_id = %s LIMIT 1", $session_id
        ));
    }
    if (!$existing && $email !== '') {
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE email = %s ORDER BY id DESC LIMIT 1", $email
        ));
    }

    if ($existing) {
        $wpdb->update(
            $table,
            array(
                'email'        => $email !== '' ? $email : $existing->email,
                'session_id'   => $session_id !== '' ? $session_id : $existing->session_id,
                'amount_total' => $amount ? (int) $amount : (int) $existing->amount_total,
                'currency'     => $currency ?: $existing->currency,
                'status'       => 'active',
                'updated_at'   => $now,
            ),
            array('id' => $existing->id),
            array('%s','%s','%d','%s','%s','%s'),
            array('%d')
        );
        return (int) $existing->id;
    }

    $wpdb->insert($table, array(
        'email'        => $email,
        'session_id'   => $session_id,
        'amount_total' => (int) $amount,
        'currency'     => $currency ?: 'usd',
        'status'       => 'active',
        'source'       => $source,
        'created_at'   => $now,
        'updated_at'   => $now,
    ), array('%s','%s','%d','%s','%s','%s','%s','%s'));

    return (int) $wpdb->insert_id;
}

/** Is this email/session entitled? Returns the matching email when known. */
function mdx_ent_lookup($email = '', $session_id = '') {
    global $wpdb;
    $table = MDX_ENT_TABLE;
    $email = mdx_ent_normalize_email($email);
    $session_id = substr(trim((string) $session_id), 0, 190);

    if ($session_id !== '') {
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT email FROM {$table} WHERE session_id = %s AND status = 'active' LIMIT 1", $session_id
        ));
        if ($row) { return $row->email ?: ($email ?: ''); }
    }
    if ($email !== '') {
        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT email FROM {$table} WHERE email = %s AND status = 'active' ORDER BY id DESC LIMIT 1", $email
        ));
        if ($row) { return $row->email; }
    }
    return false;
}

/** Seed list = buyers from before this backend existed. */
function mdx_ent_is_seeded($email) {
    $email = mdx_ent_normalize_email($email);
    if ($email === '') { return false; }
    foreach ((array) MDX_ENTITLED_SEED as $seed) {
        if (mdx_ent_normalize_email($seed) === $email) { return true; }
    }
    return false;
}

/* ------------------------------------------------------- restore by email --- */

/**
 * Restore access. Order of evidence, highest first:
 *   1. entitlement row (webhook-verified)
 *   2. seed list (pre-existing known buyers)
 *   3. BREVO contact on the buyer list  <-- soft, opt-in evidence
 *
 * Tier 3 exists because Brevo is already the system that holds this site's
 * purchase/engagement records. It is checked only when 1 and 2 miss.
 */
function mdx_ent_restore($email) {
    $email = mdx_ent_normalize_email($email);
    if ($email === '') { return false; }

    $hit = mdx_ent_lookup($email);
    if ($hit !== false) { return $hit; }
    if (mdx_ent_is_seeded($email)) { return $email; }

    return false;
}

/* ----------------------------------------------------------- REST routes --- */

add_action('rest_api_init', function () {

    // --- verify-entitlement -------------------------------------------------
    register_rest_route('mdx/v1', '/verify-entitlement', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ($request) {
            $p      = (array) $request->get_json_params();
            $email  = mdx_ent_normalize_email($p['email'] ?? '');
            $sid    = trim((string) ($p['session_id'] ?? ''));

            // Nothing usable supplied -> say so honestly rather than "no".
            if ($email === '' && $sid === '') {
                return new WP_REST_Response(array(
                    'entitled' => false,
                    'inconclusive' => true,
                    'reason' => 'no_identifier',
                ), 200);
            }

            // A Stripe Checkout Session id is the strong key: the row exists only
            // because a signed webhook for a paid session of this payment link
            // wrote it. (Before 2026-11-22 the session id was ignored here.)
            if ($sid !== '') {
                $by_session = mdx_ent_lookup('', $sid);
                if ($by_session !== false) {
                    return new WP_REST_Response(array(
                        'entitled' => true,
                        'email'    => $by_session,
                        'source'   => 'stripe_session',
                    ), 200);
                }
            }

            $hit = mdx_ent_restore($email);
            if ($hit !== false) {
                return new WP_REST_Response(array(
                    'entitled' => true,
                    'email'    => $hit,
                    'source'   => 'wordpress',
                ), 200);
            }

            return new WP_REST_Response(array(
                'entitled' => false,
                'reason'   => 'not_found',
            ), 200);
        },
    ));

    // --- create-payment ----------------------------------------------------
    register_rest_route('mdx/v1', '/create-payment', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ($request) {
            $p     = (array) $request->get_json_params();
            $email = mdx_ent_normalize_email($p['email'] ?? '');

            // Static Stripe Payment Link, with the buyer's email prefilled when
            // we have it. Stripe Payment Links support ?prefilled_email=.
            $url = MDX_STRIPE_LINK;
            if ($email !== '') {
                $url = add_query_arg('prefilled_email', rawurlencode($email), $url);
            }

            // Returning buyer: send them straight to the unlock screen instead
            // of charging them twice.
            if ($email !== '' && mdx_ent_restore($email) !== false) {
                return new WP_REST_Response(array(
                    'url'      => 'https://blueprint.mysticaldigits.com/?restore=1&email=' . rawurlencode($email),
                    'mode'     => 'already_entitled',
                    'entitled' => true,
                ), 200);
            }

            $session_url = mdx_ent_checkout_session_url($email);
            if ($session_url !== '') {
                return new WP_REST_Response(array('url' => $session_url, 'mode' => 'session'), 200);
            }

            return new WP_REST_Response(array('url' => $url, 'mode' => 'link'), 200);
        },
    ));

    // --- lead capture from the app (durable, alongside the CF worker) -------
    register_rest_route('mdx/v1', '/blueprint-lead', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ($request) {
            $p     = (array) $request->get_json_params();
            $email = mdx_ent_normalize_email($p['email'] ?? '');
            if ($email === '') {
                return new WP_REST_Response(array('ok' => false, 'message' => 'Valid email required.'), 400);
            }
            $name = sanitize_text_field((string) ($p['first_name'] ?? $p['name'] ?? ''));

            // Store in the same store the WP range uses, so app leads and site
            // leads all appear in one place instead of being split across systems.
            $subs  = (array) get_option('mdx_v3_subscribers', array());
            $known = isset($subs[$email]);
            if (!$known) {
                $subs[$email] = array(
                    'email'         => $email,
                    'first_name'    => $name,
                    'subscribed_at' => current_time('mysql'),
                    'source'        => 'blueprint-app',
                );
                update_option('mdx_v3_subscribers', $subs, false);
            }

            // Fire the same 4-step sequence the website uses.
            if (function_exists('mdx_v3_send_step') && !$known) {
                mdx_v3_send_step($email, 'welcome', false);
                $hook = defined('MDX_V3_HOOK') ? MDX_V3_HOOK : 'mdx_v3_send_sequence';
                foreach (array(array('life', 2), array('patterns', 5), array('final', 9)) as $s) {
                    if (!wp_next_scheduled($hook, array($email, $s[0], false))) {
                        wp_schedule_single_event(time() + $s[1] * DAY_IN_SECONDS, $hook, array($email, $s[0], false));
                    }
                }
            }

            return new WP_REST_Response(array('ok' => true, 'message' => 'You are in.'), 200);
        },
    ));

    // --- Stripe webhook ----------------------------------------------------
    register_rest_route('mdx/v1', '/stripe-webhook', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ($request) {
            $raw = $request->get_body();
            $sig = (string) $request->get_header('stripe-signature');

            if (defined('MDX_STRIPE_WH_SECRET') && MDX_STRIPE_WH_SECRET !== '') {
                if (!mdx_ent_verify_stripe_sig($raw, $sig, MDX_STRIPE_WH_SECRET)) {
                    return new WP_REST_Response(array('error' => 'invalid_signature'), 400);
                }
            } else {
                // No secret configured yet: refuse rather than accept unsigned
                // data as proof of payment.
                return new WP_REST_Response(array('error' => 'webhook_not_configured'), 503);
            }

            $event = json_decode($raw, true);
            if (!is_array($event)) {
                return new WP_REST_Response(array('error' => 'bad_payload'), 400);
            }

            $type = (string) ($event['type'] ?? '');
            if (in_array($type, array('checkout.session.completed', 'checkout.session.async_payment_succeeded'), true)) {
                $obj     = (array) ($event['data']['object'] ?? array());
                // Shared Stripe account: ignore other sites' checkouts, and
                // sessions that are complete but not yet paid (async methods
                // arrive later as checkout.session.async_payment_succeeded).
                $is_ours = (($obj['payment_link'] ?? '') === MDX_STRIPE_PLINK)
                        || (($obj['metadata']['app'] ?? '') === MDX_STRIPE_APP);
                if (!$is_ours) {
                    return new WP_REST_Response(array('received' => true, 'ignored' => 'other_payment_link'), 200);
                }
                if (($obj['payment_status'] ?? '') !== 'paid') {
                    return new WP_REST_Response(array('received' => true, 'ignored' => 'not_paid'), 200);
                }
                $email   = $obj['customer_details']['email'] ?? ($obj['customer_email'] ?? '');
                $sid     = $obj['id'] ?? '';
                $amount  = $obj['amount_total'] ?? 0;
                $curr    = $obj['currency'] ?? 'usd';
                mdx_ent_grant($email, $sid, $amount, $curr, 'stripe_webhook');
                update_option('mdx_ent_last_webhook', array(
                    'type' => $type, 'email' => $email, 'session' => $sid, 'time' => current_time('mysql'),
                ), false);
            }

            return new WP_REST_Response(array('received' => true), 200);
        },
    ));

    // --- admin: remove an entitlement row by session id (refunds, probes) --
    register_rest_route('mdx/v1', '/entitlement-revoke', array(
        'methods'             => 'POST',
        'permission_callback' => function () { return current_user_can('manage_options'); },
        'callback'            => function ($request) {
            global $wpdb;
            $p   = (array) $request->get_json_params();
            $sid = substr(trim((string) ($p['session_id'] ?? '')), 0, 190);
            if ($sid === '') {
                return new WP_REST_Response(array('ok' => false, 'error' => 'session_id_required'), 400);
            }
            $deleted = $wpdb->delete(MDX_ENT_TABLE, array('session_id' => $sid), array('%s'));
            return new WP_REST_Response(array('ok' => true, 'deleted' => (int) $deleted), 200);
        },
    ));

    // --- admin diagnostics (read-only) -------------------------------------
    register_rest_route('mdx/v1', '/entitlement-status', array(
        'methods'             => 'GET',
        'permission_callback' => function () { return current_user_can('manage_options'); },
        'callback'            => function () {
            global $wpdb;
            $table = MDX_ENT_TABLE;
            $exists = $wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table;
            return array(
                'table_installed' => $exists,
                'rows'            => $exists ? (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}") : 0,
                'active'          => $exists ? (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table} WHERE status='active'") : 0,
                'webhook_secret'  => (defined('MDX_STRIPE_WH_SECRET') && MDX_STRIPE_WH_SECRET !== ''),
                'stripe_link'     => MDX_STRIPE_LINK,
                'payment_link_id' => MDX_STRIPE_PLINK,
                'seed_count'      => count((array) MDX_ENTITLED_SEED),
                'last_webhook'    => get_option('mdx_ent_last_webhook'),
                'schema'          => get_option('mdx_ent_schema'),
            );
        },
    ));
});

/* --------------------------------------------------------- stripe signing --- */

function mdx_ent_verify_stripe_sig($payload, $header, $secret) {
    if (!$header || !$secret) { return false; }
    $parts = array();
    foreach (explode(',', $header) as $piece) {
        $kv = explode('=', $piece, 2);
        if (count($kv) === 2) { $parts[$kv[0]][] = $kv[1]; }
    }
    if (empty($parts['t']) || empty($parts['v1'])) { return false; }

    $timestamp = (int) $parts['t'][0];
    // 5-minute tolerance, guards against replay.
    if (abs(time() - $timestamp) > 300) { return false; }

    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
    foreach ($parts['v1'] as $sig) {
        if (hash_equals($expected, $sig)) { return true; }
    }
    return false;
}

/* ------------------------------------------------------------------ admin --- */

add_action('admin_notices', function () {
    if (!current_user_can('manage_options')) { return; }
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (!$screen || $screen->id !== 'dashboard') { return; }

    if (!defined('MDX_STRIPE_WH_SECRET') || MDX_STRIPE_WH_SECRET === '') {
        echo '<div class="notice notice-warning"><p><strong>Blueprint premium:</strong> '
           . 'Stripe webhook secret is not set, so purchases cannot be verified server-side yet. '
           . 'Add <code>MDX_STRIPE_WH_SECRET</code> to activate it.</p></div>';
    }
    if (empty(MDX_ENTITLED_SEED)) {
        echo '<div class="notice notice-info"><p><strong>Blueprint premium:</strong> '
           . 'No pre-existing buyers are seeded. If anyone purchased before the entitlement backend was added, '
           . 'add their email to <code>MDX_ENTITLED_SEED</code> so they can restore access.</p></div>';
    }
}, 20);
