/**
 * MDX Blueprint CTA
 *
 * Sends Mystical Digits readers to the free Life Path Blueprint app
 * (https://blueprint.mysticaldigits.com/).
 *
 * Adds, at render time only:
 *   1. A gold "Free Blueprint" pill at the end of the header menu (inner pages).
 *   2. HOMEPAGE: a large gold hero button directly under the headline, a
 *      "Free Blueprint App" link in the homepage header, and a CTA band after
 *      the calculator section.
 *   3. A CTA card at the end of relevant articles (400+ words).
 *   4. A compact banner before the 2nd-or-later H2 on long articles (1,500+ words).
 *   5. The shortcode [mdx_blueprint_cta variant="card|banner|button" label="..."].
 *
 * Nothing is written to posts, options or the database, so no post is re-dated
 * and no sitemap lastmod changes. ROLLBACK: deactivate this snippet.
 *
 * Skipped automatically: noindex posts, password-protected posts, legal and
 * about pages, posts that already contain the shortcode, and short posts.
 * Tune with the filters mdx_bp_eligible, mdx_bp_min_words and mdx_bp_mid_words.
 *
 * Clicks: every link carries utm_source=mysticaldigits, utm_medium=cta,
 * utm_campaign=blueprint-app, utm_content=<placement>, utm_term=<post slug>, and
 * fires a GA4 event "blueprint_cta_click" when gtag is on the page.
 */

if ( ! function_exists( 'mdx_bp_url' ) ) {

	/** App URL tagged so each placement and page shows up in GA4. */
	function mdx_bp_url( $placement ) {
		$slug = '';
		if ( is_front_page() ) {
			$slug = 'home';
		} elseif ( is_singular() ) {
			$slug = (string) get_post_field( 'post_name', get_queried_object_id() );
		}
		$args = array(
			'utm_source'   => 'mysticaldigits',
			'utm_medium'   => 'cta',
			'utm_campaign' => 'blueprint-app',
			'utm_content'  => sanitize_key( $placement ),
			'utm_term'     => sanitize_title( $slug ),
		);
		return add_query_arg( array_filter( $args ), 'https://blueprint.mysticaldigits.com/' );
	}

	/** Markup templates. {{BTN}} is replaced with the button. */
	function mdx_bp_tpl( $name ) {
		static $t = null;
		if ( null === $t ) {
			$card = <<<'HTML'
<aside class="mdx-bp mdx-bp--card" aria-label="Free Life Path Blueprint">
<div class="mdx-bp__in">
<svg class="mdx-bp__const" viewBox="0 0 220 60" aria-hidden="true" focusable="false"><g fill="none" stroke="rgba(233,196,106,.5)" stroke-width="1"><polyline points="12,44 48,16 92,36 130,12 176,38 208,18"/></g><g fill="#f8e08e"><circle cx="12" cy="44" r="3"/><circle cx="48" cy="16" r="3.4"/><circle cx="92" cy="36" r="3"/><circle cx="130" cy="12" r="3.6"/><circle cx="176" cy="38" r="3"/><circle cx="208" cy="18" r="3.4"/></g></svg>
<p class="mdx-bp__eyebrow">&#10022; Free &middot; about 2 minutes</p>
<p class="mdx-bp__title">Get Your Free Life Path Blueprint</p>
<p class="mdx-bp__text">Enter your full birth name and birth date to see your Life Path, Destiny, Soul Urge, Personality, Birthday and Personal Year numbers, each with a written interpretation.</p>
<ul class="mdx-bp__chips"><li>6 core numbers</li><li>Printable 19-page PDF</li><li>Free to start</li></ul>
{{BTN}}
<p class="mdx-bp__fine">Numerology is a tool for reflection, not a prediction. A Premium Edition is optional.</p>
</div>
</aside>
HTML;

			$home = <<<'HTML'
<aside class="mdx-bp mdx-bp--card" aria-label="Free Life Path Blueprint">
<div class="mdx-bp__in">
<svg class="mdx-bp__const" viewBox="0 0 220 60" aria-hidden="true" focusable="false"><g fill="none" stroke="rgba(233,196,106,.5)" stroke-width="1"><polyline points="12,44 48,16 92,36 130,12 176,38 208,18"/></g><g fill="#f8e08e"><circle cx="12" cy="44" r="3"/><circle cx="48" cy="16" r="3.4"/><circle cx="92" cy="36" r="3"/><circle cx="130" cy="12" r="3.6"/><circle cx="176" cy="38" r="3"/><circle cx="208" cy="18" r="3.4"/></g></svg>
<p class="mdx-bp__eyebrow">&#10022; The full reading &middot; free</p>
<p class="mdx-bp__title">Turn your numbers into a personal Blueprint</p>
<p class="mdx-bp__text">The calculators above show your numbers. The free Blueprint app writes an interpretation of all six core numbers and turns them into a printable 19-page PDF.</p>
<ul class="mdx-bp__chips"><li>6 core numbers</li><li>Printable 19-page PDF</li><li>Free to start</li></ul>
{{BTN}}
<p class="mdx-bp__fine">Numerology is a tool for reflection, not a prediction. A Premium Edition is optional.</p>
</div>
</aside>
HTML;

			$banner = <<<'HTML'
<aside class="mdx-bp mdx-bp--banner" aria-label="Free Life Path Blueprint">
<div class="mdx-bp__in">
<div class="mdx-bp__copy">
<p class="mdx-bp__eyebrow">&#10022; Curious about your own numbers?</p>
<p class="mdx-bp__text">Get your free Life Path Blueprint: six core numbers, each with a written interpretation.</p>
</div>
{{BTN}}
</div>
</aside>
HTML;

			$t = array( 'card' => $card, 'home' => $home, 'banner' => $banner );
		}
		return isset( $t[ $name ] ) ? $t[ $name ] : '';
	}

	/** The gold button. */
	function mdx_bp_button( $placement, $label = '' ) {
		$label = ( '' !== trim( (string) $label ) ) ? $label : 'Get My Free Blueprint';
		return '<a class="mdx-bp__btn" href="' . esc_url( mdx_bp_url( $placement ) ) . '" target="_blank" rel="noopener" data-mdx-bp="' . esc_attr( $placement ) . '">'
			. '<span>' . esc_html( $label ) . '</span>'
			. '<svg class="mdx-bp__arr" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
			. '<span class="mdx-bp__sr"> (opens the free Life Path Blueprint app in a new tab)</span></a>';
	}

	/** The large hero button (homepage only). */
	function mdx_bp_hero_button() {
		return '<a class="mdx-bp__btn mdx-bp__btn--xl" href="' . esc_url( mdx_bp_url( 'hero' ) ) . '" target="_blank" rel="noopener" data-mdx-bp="hero">'
			. '<span class="mdx-bp__spark" aria-hidden="true">&#10022;</span>'
			. '<span class="mdx-bp__stack"><b>Get My Free Life Path Blueprint</b><small>All 6 core numbers + a printable PDF &middot; about 2 minutes</small></span>'
			. '<svg class="mdx-bp__arr" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
			. '<span class="mdx-bp__sr"> (opens the free Life Path Blueprint app in a new tab)</span></a>';
	}

	/** Render a variant: card, home, banner or button. */
	function mdx_bp_render( $variant = 'card', $placement = 'shortcode', $label = '' ) {
		$button = mdx_bp_button( $placement, $label );
		if ( 'button' === $variant ) {
			return '<p class="mdx-bp-inline">' . $button . '</p>';
		}
		$tpl = mdx_bp_tpl( $variant );
		if ( '' === $tpl ) {
			$tpl = mdx_bp_tpl( 'card' );
		}
		return str_replace( '{{BTN}}', $button, $tpl );
	}

	/** Word count of rendered content. */
	function mdx_bp_words( $html ) {
		$text = wp_strip_all_tags( $html );
		return (int) preg_match_all( '/\S+/u', $text );
	}

	/** True when opening and closing counts match for every tag that could hold our block. (<p> is left out on purpose: browsers close an open <p> at any block element, and stray <p> tags in older posts would otherwise block most placements.) */
	function mdx_bp_balanced( $html ) {
		$tags = array( 'div', 'section', 'ul', 'ol', 'table', 'blockquote', 'figure', 'details', 'aside', 'nav', 'form', 'script', 'style', 'pre', 'textarea' );
		foreach ( $tags as $tag ) {
			$open  = preg_match_all( '/<' . $tag . '[\s>]/i', $html );
			$close = preg_match_all( '/<\/' . $tag . '>/i', $html );
			if ( $open !== $close ) {
				return false;
			}
		}
		return true;
	}

	/** Insert $html before the 2nd..6th H2, at the first spot that is not inside another block. */
	function mdx_bp_insert_mid( $content, $html ) {
		if ( ! preg_match_all( '/<h2[\s>]/i', $content, $m, PREG_OFFSET_CAPTURE ) ) {
			return $content;
		}
		$count = count( $m[0] );
		for ( $i = 1; $i < $count && $i < 6; $i++ ) {
			$pos    = $m[0][ $i ][1];
			$before = substr( $content, 0, $pos );
			if ( mdx_bp_balanced( $before ) ) {
				return $before . $html . substr( $content, $pos );
			}
		}
		return $content;
	}

	/** Is this post a sensible place for the CTA? */
	function mdx_bp_eligible( $post ) {
		$ok = true;
		if ( ! $post || 'publish' !== $post->post_status || post_password_required( $post ) ) {
			$ok = false;
		} elseif ( '1' === (string) get_post_meta( $post->ID, '_yoast_wpseo_meta-robots-noindex', true ) ) {
			$ok = false; // Never spend a CTA on a page search engines can't show.
		} elseif ( 'page' === $post->post_type && preg_match( '/^(about|contact|privacy|terms|disclaimer|cookie|editorial|review-methodology|numerology-interpretation-limitations|affiliate)/i', $post->post_name ) ) {
			$ok = false;
		} elseif ( has_shortcode( $post->post_content, 'mdx_blueprint_cta' ) ) {
			$ok = false; // The editor placed it by hand.
		} elseif ( ! preg_match( '/numerolog|life-?path|angel|number|calculat|birth|name|destiny|soul|expression|personal-?year|karmic|master|compatib|chaldean|pythagorean|chart|blueprint|astrolog|zodiac|horoscope|tarot|spiritual|meaning/i', $post->post_name . ' ' . $post->post_title ) ) {
			$ok = false;
		}
		return (bool) apply_filters( 'mdx_bp_eligible', $ok, $post );
	}

	/** Homepage: a band after the calculator section, and a link in the page's own header. */
	function mdx_bp_home( $content ) {
		// The big gold button goes directly under the headline, above the intro
		// text, so it is on the first screen. Falls back to under the hero buttons.
		$hero = '<div class="mdx-bp-hero">' . mdx_bp_hero_button() . '</div>';
		$mark = strpos( $content, 'id="hero-definition"' );
		$open = ( false !== $mark ) ? strrpos( substr( $content, 0, $mark ), '<p' ) : false;
		if ( false !== $open ) {
			$content = substr( $content, 0, $open ) . $hero . substr( $content, $open );
		} elseif ( preg_match( '#<div class="hero-ctas[^>]*>.*?</div>#s', $content, $m, PREG_OFFSET_CAPTURE ) ) {
			$end     = $m[0][1] + strlen( $m[0][0] );
			$content = substr( $content, 0, $end ) . $hero . substr( $content, $end );
		}
		$anchor = '<section class="band-alt" id="method"';
		$pos    = strpos( $content, $anchor );
		if ( false !== $pos ) {
			$band    = '<section class="mdx-bp-band">' . mdx_bp_render( 'home', 'home' ) . '</section>';
			$content = substr_replace( $content, $band, $pos, 0 );
		}
		$nav_anchor = '<li><a href="#quiz">Quiz</a></li>';
		if ( false !== strpos( $content, $nav_anchor ) ) {
			$link    = '<li><a class="mdx-bp-homelink" href="' . esc_url( mdx_bp_url( 'home-nav' ) ) . '" target="_blank" rel="noopener" data-mdx-bp="home-nav">&#10022; Free Blueprint App</a></li>';
			$content = str_replace( $nav_anchor, $link . $nav_anchor, $content );
		}
		return $content;
	}

	/** the_content: runs last so no other filter rewrites the block. */
	function mdx_bp_filter_content( $content ) {
		static $done = array();
		try {
			if ( is_admin() || is_feed() || is_embed() || ! is_singular( array( 'post', 'page' ) ) ) {
				return $content;
			}
			if ( ! in_the_loop() || ! is_main_query() || false !== strpos( $content, 'mdx-bp' ) ) {
				return $content;
			}
			$post = get_post();
			if ( ! $post || isset( $done[ $post->ID ] ) ) {
				return $content;
			}
			if ( is_front_page() ) {
				$done[ $post->ID ] = true;
				return mdx_bp_home( $content );
			}
			if ( ! mdx_bp_eligible( $post ) ) {
				return $content;
			}
			$words = mdx_bp_words( $content );
			if ( $words < (int) apply_filters( 'mdx_bp_min_words', 400 ) ) {
				return $content;
			}
			$done[ $post->ID ] = true;
			if ( $words >= (int) apply_filters( 'mdx_bp_mid_words', 1500 ) ) {
				$content = mdx_bp_insert_mid( $content, mdx_bp_render( 'banner', 'inline' ) );
			}
			return $content . mdx_bp_render( 'card', 'end' );
		} catch ( \Throwable $e ) {
			return $content; // Never break a page over a call to action.
		}
	}
	add_filter( 'the_content', 'mdx_bp_filter_content', 9999 );

	/** Header menu pill (inner pages; the homepage has its own header). */
	function mdx_bp_nav_item( $items, $args ) {
		try {
			if ( is_admin() || is_front_page() || empty( $args->theme_location ) || 'primary' !== $args->theme_location ) {
				return $items;
			}
			return $items . '<li class="menu-item mdx-bp-menu"><a class="mdx-bp__navbtn" href="' . esc_url( mdx_bp_url( 'nav' ) ) . '" target="_blank" rel="noopener" data-mdx-bp="nav"><span aria-hidden="true">&#10022;</span> Free Blueprint<span class="mdx-bp__sr"> (opens in a new tab)</span></a></li>';
		} catch ( \Throwable $e ) {
			return $items;
		}
	}
	add_filter( 'wp_nav_menu_items', 'mdx_bp_nav_item', 20, 2 );

	/** [mdx_blueprint_cta variant="card|banner|button" label="Get My Free Blueprint"] */
	function mdx_bp_shortcode( $atts ) {
		$a = shortcode_atts( array( 'variant' => 'card', 'label' => '', 'placement' => 'shortcode' ), $atts, 'mdx_blueprint_cta' );
		return mdx_bp_render( sanitize_key( $a['variant'] ), sanitize_key( $a['placement'] ), $a['label'] );
	}
	add_shortcode( 'mdx_blueprint_cta', 'mdx_bp_shortcode' );

	/** Stylesheet: printed once, in the head, so the block never flashes unstyled. */
	function mdx_bp_css() {
		return <<<'CSS'
.mdx-bp{--g1:#f8e08e;--g2:#e9b949;--g3:#c58a2b;position:relative;isolation:isolate;box-sizing:border-box;clear:both;max-width:760px;margin:2.4rem auto;padding:2px;border-radius:22px;background:linear-gradient(135deg,#6d5efc,#a855f7 42%,#ff8a5c 74%,#e9c46a);box-shadow:0 22px 50px -22px rgba(109,94,252,.65);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5;text-align:left}
.mdx-bp *,.mdx-bp *::before,.mdx-bp *::after{box-sizing:border-box}
.mdx-bp .mdx-bp__in{position:relative;overflow:hidden;border-radius:20px;padding:clamp(22px,4.6vw,40px);text-align:center;color:#f4efe6;background:radial-gradient(120% 90% at 100% 0,rgba(168,85,247,.26),transparent 55%),radial-gradient(90% 80% at 0 100%,rgba(255,138,92,.16),transparent 60%),linear-gradient(180deg,#101228,#080a16)}
.mdx-bp .mdx-bp__in::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.7;background-image:radial-gradient(1.4px 1.4px at 8% 18%,#fff,transparent),radial-gradient(1px 1px at 22% 72%,#fffc,transparent),radial-gradient(1.4px 1.4px at 41% 12%,#ffe9a8,transparent),radial-gradient(1px 1px at 63% 84%,#fffc,transparent),radial-gradient(1.4px 1.4px at 78% 24%,#fff,transparent),radial-gradient(1px 1px at 93% 66%,#ffe9a8,transparent)}
.mdx-bp .mdx-bp__in>*{position:relative;z-index:1}
.mdx-bp .mdx-bp__const{display:block;width:min(220px,60%);height:auto;margin:0 auto 10px;opacity:.95}
.mdx-bp p{margin:0 !important;padding:0 !important;max-width:none !important}
.mdx-bp .mdx-bp__eyebrow{color:#e9c46a !important;font-size:.74rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
.mdx-bp .mdx-bp__title{margin-top:.6rem !important;color:#f4efe6 !important;font-family:Cinzel,"Cormorant Garamond",Georgia,"Times New Roman",serif;font-weight:700;font-size:clamp(1.5rem,4.2vw,2.15rem);line-height:1.18;letter-spacing:.01em;text-wrap:balance}
.mdx-bp .mdx-bp__text{margin:.85rem auto 0 !important;max-width:34em !important;color:#c9c4d8 !important;font-size:1rem;line-height:1.6}
.mdx-bp .mdx-bp__chips{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem;margin:1.15rem 0 1.45rem !important;padding:0 !important;list-style:none !important}
.mdx-bp .mdx-bp__chips li{margin:0 !important;padding:.32rem .8rem !important;list-style:none !important;border:1px solid rgba(233,196,106,.38);border-radius:999px;background:rgba(233,196,106,.08);color:#f1e2b6 !important;font-size:.8rem;font-weight:600}
.mdx-bp .mdx-bp__btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.6em;min-height:56px;padding:0 2rem;overflow:hidden;border:0;border-radius:999px;background:linear-gradient(135deg,var(--g1) 0%,var(--g2) 48%,var(--g3) 100%);color:#1a1204 !important;font-size:1.02rem;font-weight:800;letter-spacing:.03em;text-decoration:none !important;box-shadow:0 12px 30px -10px rgba(233,185,73,.75),inset 0 1px 0 rgba(255,255,255,.6);transition:transform .2s ease,box-shadow .2s ease}
.mdx-bp .mdx-bp__btn::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.65) 50%,transparent 65%);transform:translateX(-130%);animation:mdxbp-shine 5.5s ease-in-out 1.5s infinite}
.mdx-bp .mdx-bp__btn:hover,.mdx-bp .mdx-bp__btn:focus-visible{transform:translateY(-2px);box-shadow:0 18px 38px -10px rgba(233,185,73,.9),inset 0 1px 0 rgba(255,255,255,.7);color:#1a1204 !important}
.mdx-bp .mdx-bp__btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
.mdx-bp .mdx-bp__arr{flex:none;transition:transform .2s ease}
.mdx-bp .mdx-bp__btn:hover .mdx-bp__arr{transform:translateX(4px)}
.mdx-bp .mdx-bp__fine{margin-top:1rem !important;color:#9c97b0 !important;font-size:.78rem}
.mdx-bp .mdx-bp__sr,.mdx-bp__sr{position:absolute !important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.mdx-bp--banner{max-width:820px;margin:2rem auto;border-radius:18px}
.mdx-bp--banner .mdx-bp__in{display:flex;flex-direction:column;align-items:center;gap:1.1rem;padding:clamp(18px,3.6vw,26px);border-radius:16px}
.mdx-bp--banner .mdx-bp__text{margin:.35rem auto 0 !important;font-size:.98rem}
.mdx-bp--banner .mdx-bp__btn{min-height:50px;padding:0 1.6rem;font-size:.98rem}
@media (min-width:720px){.mdx-bp--banner .mdx-bp__in{flex-direction:row;justify-content:space-between;text-align:left;gap:1.6rem}.mdx-bp--banner .mdx-bp__text{margin-left:0 !important}.mdx-bp--banner .mdx-bp__btn{flex:none}}
.mdx-bp-hero{margin:1.1rem 0 0}
.mdx-bp-hero .mdx-bp__btn--xl,.mdx-bp__btn--xl{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.85rem;max-width:100%;min-height:68px;padding:.7rem 1.7rem;overflow:hidden;border-radius:999px;background:linear-gradient(135deg,#f8e08e 0%,#e9b949 48%,#c58a2b 100%);color:#1a1204 !important;text-align:left;text-decoration:none !important;box-shadow:0 0 0 1px rgba(255,236,170,.55),0 16px 40px -10px rgba(233,185,73,.85),0 0 46px rgba(233,185,73,.28),inset 0 1px 0 rgba(255,255,255,.65);transition:transform .2s ease,box-shadow .2s ease}
.mdx-bp__btn--xl::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.7) 50%,transparent 65%);transform:translateX(-130%);animation:mdxbp-shine 5s ease-in-out 1s infinite}
.mdx-bp__btn--xl:hover,.mdx-bp__btn--xl:focus-visible{transform:translateY(-3px);box-shadow:0 0 0 1px rgba(255,236,170,.8),0 22px 48px -10px rgba(233,185,73,.95),0 0 60px rgba(233,185,73,.4),inset 0 1px 0 rgba(255,255,255,.75);color:#1a1204 !important}
.mdx-bp__btn--xl:focus-visible{outline:3px solid #fff;outline-offset:3px}
.mdx-bp__btn--xl .mdx-bp__spark{flex:none;font-size:1.5rem;line-height:1}
.mdx-bp__btn--xl .mdx-bp__stack{display:flex;flex-direction:column;gap:.2rem;line-height:1.15}
.mdx-bp__btn--xl .mdx-bp__stack b{font-size:1.12rem;font-weight:800;letter-spacing:.01em}
.mdx-bp__btn--xl .mdx-bp__stack small{font-size:.78rem;font-weight:600;opacity:.78}
.mdx-bp__btn--xl .mdx-bp__arr{flex:none;transition:transform .2s ease}
.mdx-bp__btn--xl:hover .mdx-bp__arr{transform:translateX(5px)}
@media (max-width:520px){.mdx-bp-hero{margin-top:1rem}.mdx-bp__btn--xl{display:flex;width:100%;padding:.8rem 1.2rem}.mdx-bp__btn--xl .mdx-bp__stack b{font-size:1.02rem}}
.mdx-bp-inline{margin:1.6rem 0 !important;text-align:center}
.mdx-bp-inline .mdx-bp__btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.6em;min-height:54px;padding:0 1.9rem;overflow:hidden;border-radius:999px;background:linear-gradient(135deg,#f8e08e,#e9b949 48%,#c58a2b);color:#1a1204 !important;font:800 1rem/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;text-decoration:none !important;box-shadow:0 12px 30px -10px rgba(233,185,73,.75)}
.mdx-bp-band{padding:clamp(2.5rem,6vw,4rem) 1.25rem}
.mdx-bp-band .mdx-bp{margin-top:0;margin-bottom:0}
.main-navigation .main-nav ul li.mdx-bp-menu{display:flex;align-items:center}
.main-navigation .main-nav ul li.mdx-bp-menu>a.mdx-bp__navbtn{display:inline-flex !important;align-items:center;gap:.4em;height:auto !important;line-height:1 !important;margin:0 0 0 .75rem;padding:.7rem 1.15rem !important;border-radius:999px;background:linear-gradient(135deg,#f8e08e,#e9b949 48%,#c58a2b) !important;color:#1a1204 !important;font-size:.88rem;font-weight:800;letter-spacing:.02em;text-decoration:none !important;box-shadow:0 8px 20px -8px rgba(233,185,73,.8);transition:transform .2s ease,box-shadow .2s ease}
.main-navigation .main-nav ul li.mdx-bp-menu>a.mdx-bp__navbtn:hover,.main-navigation .main-nav ul li.mdx-bp-menu>a.mdx-bp__navbtn:focus-visible{transform:translateY(-1px);box-shadow:0 12px 24px -8px rgba(233,185,73,.95);color:#1a1204 !important}
@media (max-width:768px){.main-navigation .main-nav ul li.mdx-bp-menu{display:block;padding:.6rem 1.25rem}.main-navigation .main-nav ul li.mdx-bp-menu>a.mdx-bp__navbtn{display:flex !important;justify-content:center;margin:0;padding:.95rem 1.2rem !important;font-size:1rem}}
#nav .mdx-bp-homelink{color:#e9c46a !important;font-weight:700}
@keyframes mdxbp-shine{0%,62%{transform:translateX(-130%)}100%{transform:translateX(130%)}}
@media (prefers-reduced-motion:reduce){.mdx-bp .mdx-bp__btn::after,.mdx-bp__btn--xl::after{animation:none}.mdx-bp .mdx-bp__btn,.mdx-bp .mdx-bp__arr,.main-navigation .main-nav ul li.mdx-bp-menu>a.mdx-bp__navbtn{transition:none}.mdx-bp .mdx-bp__btn:hover,.mdx-bp .mdx-bp__btn:focus-visible{transform:none}}
@media print{.mdx-bp,.mdx-bp-inline,.mdx-bp-menu{display:none !important}}
CSS;
	}

	function mdx_bp_print_css() {
		if ( is_admin() || is_feed() || is_embed() ) {
			return;
		}
		echo "\n<style id=\"mdx-bp-css\">" . mdx_bp_css() . "</style>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	add_action( 'wp_head', 'mdx_bp_print_css', 20 );

	/** One delegated click listener that reports CTA clicks to GA4. */
	function mdx_bp_print_js() {
		if ( is_admin() || is_feed() || is_embed() ) {
			return;
		}
		echo "\n<script id=\"mdx-bp-js\">document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[data-mdx-bp]'):null;if(!a){return;}try{if(typeof window.gtag==='function'){window.gtag('event','blueprint_cta_click',{placement:a.getAttribute('data-mdx-bp'),page_path:location.pathname,transport_type:'beacon'});}}catch(x){}},true);</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	add_action( 'wp_footer', 'mdx_bp_print_js', 99 );
}
