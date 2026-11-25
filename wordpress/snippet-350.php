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
 *        body {session_id?: string, token?: string, email?: string}
 *        -> {entitled: bool, email?: string, reason?: string, receipt?: {...}}
 *        (since 2026-11-25 an email alone returns reason "use_restore_link")
 *   POST /wp-json/mdx/v1/request-restore
 *        body {email: string} -> {ok: true}  (emails a 24 h unlock link)
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

/* -------------------------------------------- restore links + receipts --- */
/*
 * 2026-11-25. Restoring by a typed email address used to unlock the Premium
 * Edition outright, so anyone who knew a buyer's address could get the paid
 * file, and the answer told them that person had bought it. Now a restore
 * request emails a signed, 24-hour link to the address on the purchase, and
 * verify-entitlement unlocks only on a Stripe session id or that token.
 *
 * Tokens are HMAC-signed with a key derived from this site's auth salt, so
 * nothing new has to be stored. Format: base64url(json{e,x}) "." base64url(sig)
 */
function mdx_ent_token_key() {
    return hash_hmac('sha256', 'mdx-blueprint-restore-v1', wp_salt('auth'));
}
function mdx_ent_b64u($raw) {
    return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
}
function mdx_ent_b64u_decode($text) {
    return base64_decode(strtr((string) $text, '-_', '+/'), true);
}
function mdx_ent_make_token($email, $ttl = DAY_IN_SECONDS) {
    $body = mdx_ent_b64u(wp_json_encode(array('e' => mdx_ent_normalize_email($email), 'x' => time() + (int) $ttl)));
    return $body . '.' . mdx_ent_b64u(hash_hmac('sha256', $body, mdx_ent_token_key(), true));
}
/** Returns the email a valid, unexpired token was issued for, or false. */
function mdx_ent_check_token($token) {
    $token = trim((string) $token);
    if ($token === '' || strlen($token) > 600 || substr_count($token, '.') !== 1) { return false; }
    list($body, $sig) = explode('.', $token, 2);
    $expected = mdx_ent_b64u(hash_hmac('sha256', $body, mdx_ent_token_key(), true));
    if (!hash_equals($expected, $sig)) { return false; }
    $data = json_decode((string) mdx_ent_b64u_decode($body), true);
    if (!is_array($data) || empty($data['e']) || empty($data['x']) || (int) $data['x'] < time()) { return false; }
    $email = mdx_ent_normalize_email($data['e']);
    return $email !== '' ? $email : false;
}

/** The active entitlement row for a session id, else for an email. */
function mdx_ent_row($email = '', $session_id = '') {
    global $wpdb;
    $table = MDX_ENT_TABLE;
    $session_id = substr(trim((string) $session_id), 0, 190);
    $email = mdx_ent_normalize_email($email);
    if ($session_id !== '') {
        return $wpdb->get_row($wpdb->prepare(
            "SELECT email, session_id, amount_total, currency, created_at FROM {$table} WHERE session_id = %s AND status = 'active' LIMIT 1", $session_id
        ));
    }
    if ($email !== '') {
        return $wpdb->get_row($wpdb->prepare(
            "SELECT email, session_id, amount_total, currency, created_at FROM {$table} WHERE email = %s AND status = 'active' ORDER BY id DESC LIMIT 1", $email
        ));
    }
    return null;
}

/** Order facts for the success page: only what the webhook recorded. */
function mdx_ent_receipt($row) {
    if (!$row) { return null; }
    return array(
        'amount_total' => (int) $row->amount_total,
        'currency'     => (string) $row->currency,
        'purchased_at' => (string) $row->created_at,
    );
}

/** Fixed-window rate limit. True while under the limit. */
function mdx_ent_rate_ok($key, $limit, $window) {
    $key = 'mdx_rl_' . md5($key);
    $count = (int) get_transient($key);
    if ($count >= $limit) { return false; }
    set_transient($key, $count + 1, $window);
    return true;
}

function mdx_ent_client_ip() {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ($_SERVER['REMOTE_ADDR'] ?? '');
    return substr(preg_replace('/[^0-9a-fA-F:.]/', '', (string) $ip), 0, 64);
}

/** Transactional mail through the site's Brevo sender (snippet 8), else wp_mail. */
function mdx_ent_mail($to, $subject, $html) {
    if (function_exists('mdx_v3_mail')) { return (bool) mdx_v3_mail($to, $subject, $html); }
    return (bool) wp_mail($to, $subject, $html, array('Content-Type: text/html; charset=UTF-8'));
}

function mdx_ent_restore_url($email) {
    return 'https://blueprint.mysticaldigits.com/restore#token=' . rawurlencode(mdx_ent_make_token($email));
}

function mdx_ent_email_shell($title, $inner) {
    return '<!doctype html><html><body style="margin:0;padding:24px;background:#f7f5f0;font-family:Georgia,serif;color:#2b2620;">'
        . '<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e0d8cc;border-radius:12px;padding:28px;">'
        . '<p style="margin:0 0 6px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#8a7a5c;">Mystical Digits</p>'
        . '<h1 style="margin:0 0 16px;font-size:22px;">' . esc_html($title) . '</h1>' . $inner
        . '<p style="margin:24px 0 0;font-size:12px;color:#777;">Numerology is a reflective and entertainment practice; it does not predict events. '
        . '<a href="https://blueprint.mysticaldigits.com/terms" style="color:#8a6d2f;">Terms &amp; refunds</a> &middot; '
        . '<a href="https://blueprint.mysticaldigits.com/privacy" style="color:#8a6d2f;">Privacy</a></p>'
        . '</div></body></html>';
}

function mdx_ent_button($url, $label) {
    return '<p style="margin:20px 0;"><a href="' . esc_url($url) . '" style="display:inline-block;background:#4a3f35;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold;">' . esc_html($label) . '</a></p>';
}

function mdx_ent_send_restore_email($email) {
    $inner = '<p>Someone (hopefully you) asked to open the Mystical Digits Blueprint Premium Edition bought with this address.</p>'
        . mdx_ent_button(mdx_ent_restore_url($email), 'Unlock my Premium Edition')
        . '<p style="font-size:14px;color:#555;">The link works for 24 hours and unlocks the Premium Edition in the browser you open it in. '
        . "If you didn't ask for this, you can ignore this email.</p>";
    return mdx_ent_mail($email, 'Your Premium Edition unlock link', mdx_ent_email_shell('Your unlock link', $inner));
}

function mdx_ent_send_receipt_email($email, $amount, $currency, $session_id) {
    $money = strtoupper((string) $currency) === 'USD'
        ? '$' . number_format(((int) $amount) / 100, 2)
        : number_format(((int) $amount) / 100, 2) . ' ' . strtoupper((string) $currency);
    $inner = '<p>Thank you for your purchase.</p>'
        . '<table style="font-size:14px;border-collapse:collapse;margin:8px 0 4px;">'
        . '<tr><td style="padding:3px 16px 3px 0;color:#777;">Item</td><td>Mystical Digits Blueprint, Premium Edition (PDF)</td></tr>'
        . '<tr><td style="padding:3px 16px 3px 0;color:#777;">Paid</td><td>' . esc_html($money) . ', one-time</td></tr>'
        . '<tr><td style="padding:3px 16px 3px 0;color:#777;">Date</td><td>' . esc_html(current_time('Y-m-d')) . '</td></tr>'
        . '<tr><td style="padding:3px 16px 3px 0;color:#777;">Reference</td><td>' . esc_html(substr((string) $session_id, -10)) . '</td></tr>'
        . '</table>'
        . '<p style="font-size:14px;">Your Premium Edition is unlocked in the browser you paid in. To open it on another device in the next 24 hours, use this link:</p>'
        . mdx_ent_button(mdx_ent_restore_url($email), 'Unlock on another device')
        . "<p style=\"font-size:14px;color:#555;\">After that, choose \"Already purchased? Restore it\" on blueprint.mysticaldigits.com and we'll email you a fresh link. "
        . 'Stripe sends your payment receipt separately. Questions or a refund: reply to this email.</p>';
    return mdx_ent_mail($email, 'Your Mystical Digits Premium Edition', mdx_ent_email_shell('Order confirmed', $inner));
}

/* ----------------------------------------------------------- REST routes --- */

add_action('rest_api_init', function () {

    // --- verify-entitlement -------------------------------------------------
    register_rest_route('mdx/v1', '/verify-entitlement', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ($request) {
            $p     = (array) $request->get_json_params();
            $email = mdx_ent_normalize_email($p['email'] ?? '');
            $sid   = trim((string) ($p['session_id'] ?? ''));
            $token = trim((string) ($p['token'] ?? ''));

            // 1. A restore link from the buyer's inbox.
            if ($token !== '') {
                $owner = mdx_ent_check_token($token);
                if ($owner !== false && mdx_ent_restore($owner) !== false) {
                    return new WP_REST_Response(array(
                        'entitled' => true,
                        'email'    => $owner,
                        'source'   => 'restore_link',
                        'receipt'  => mdx_ent_receipt(mdx_ent_row($owner)),
                    ), 200);
                }
                return new WP_REST_Response(array('entitled' => false, 'reason' => 'bad_token'), 200);
            }

            if ($email === '' && $sid === '') {
                return new WP_REST_Response(array(
                    'entitled' => false,
                    'inconclusive' => true,
                    'reason' => 'no_identifier',
                ), 200);
            }

            // 2. A Stripe Checkout Session id. The row exists only because a
            //    signed webhook for a paid Blueprint session wrote it.
            if ($sid !== '') {
                $row = mdx_ent_row('', $sid);
                if ($row) {
                    return new WP_REST_Response(array(
                        'entitled' => true,
                        'email'    => $row->email,
                        'source'   => 'stripe_session',
                        'receipt'  => mdx_ent_receipt($row),
                    ), 200);
                }
                return new WP_REST_Response(array('entitled' => false, 'reason' => 'not_found'), 200);
            }

            // 3. An email address alone proves nothing (anyone can type one),
            //    so it no longer unlocks. The app asks for a restore link.
            return new WP_REST_Response(array('entitled' => false, 'reason' => 'use_restore_link'), 200);
        },
    ));

    // --- request-restore (2026-11-25) ----------------------------------------
    // Emails a 24-hour unlock link if the address has a purchase. The reply is
    // the same either way, so it cannot be used to learn who bought.
    register_rest_route('mdx/v1', '/request-restore', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ($request) {
            $p     = (array) $request->get_json_params();
            $email = mdx_ent_normalize_email($p['email'] ?? '');
            if ($email === '') {
                return new WP_REST_Response(array('ok' => false, 'message' => 'Valid email required.'), 400);
            }
            $allowed = mdx_ent_rate_ok('rr_ip_' . mdx_ent_client_ip(), 10, HOUR_IN_SECONDS)
                    && mdx_ent_rate_ok('rr_em_' . $email, 3, HOUR_IN_SECONDS);
            if ($allowed && mdx_ent_restore($email) !== false) {
                mdx_ent_send_restore_email($email);
            }
            return new WP_REST_Response(array('ok' => true), 200);
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

            // Returning buyer: never charge twice, and never unlock on the typed
            // address. Email them an unlock link instead. The URL is for app
            // builds older than 2026-11-25, which open it in a new tab.
            if ($email !== '' && mdx_ent_restore($email) !== false) {
                if (mdx_ent_rate_ok('cp_em_' . $email, 3, HOUR_IN_SECONDS)) {
                    mdx_ent_send_restore_email($email);
                }
                return new WP_REST_Response(array(
                    'url'      => 'https://blueprint.mysticaldigits.com/?restore=sent',
                    'mode'     => 'restore_sent',
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
                // Stripe retries deliveries, so only the first one for a session
                // sends the confirmation email.
                $is_new = $sid !== '' && !mdx_ent_row('', $sid);
                mdx_ent_grant($email, $sid, $amount, $curr, 'stripe_webhook');
                if ($is_new && mdx_ent_normalize_email($email) !== '') {
                    mdx_ent_send_receipt_email(mdx_ent_normalize_email($email), $amount, $curr, $sid);
                }
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
