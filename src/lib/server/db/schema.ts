import {
	mysqlTable,
	int,
	varchar,
	text,
	boolean,
	timestamp,
	date,
	mysqlEnum,
	uniqueIndex,
	customType
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Hostinger's Node.js hosting rebuilds the app from git on every deploy, so
// anything saved to plain disk (e.g. process.cwd()/uploads) is wiped on the
// very next push — there's no persistent volume outside the git-tracked
// source. Storing uploaded file bytes here instead means they live in the
// same database that already reliably survives every deploy.
const longblob = customType<{ data: Buffer }>({
	dataType() {
		return 'longblob';
	}
});

// --- Catalog ---

export const categories = mysqlTable(
	'categories',
	{
		id: int('id').autoincrement().primaryKey(),
		name: varchar('name', { length: 100 }).notNull(),
		slug: varchar('slug', { length: 100 }).notNull(),
		description: text('description'),
		sortOrder: int('sort_order').notNull().default(0),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [uniqueIndex('categories_slug_unique').on(table.slug)]
);

export const products = mysqlTable(
	'products',
	{
		id: int('id').autoincrement().primaryKey(),
		categoryId: int('category_id')
			.notNull()
			.references(() => categories.id),
		name: varchar('name', { length: 150 }).notNull(),
		slug: varchar('slug', { length: 150 }).notNull(),
		description: text('description'),
		basePricePence: int('base_price_pence').notNull(),
		salePricePence: int('sale_price_pence'),
		badge: mysqlEnum('badge', ['none', 'sale', 'new']).notNull().default('none'),
		isActive: boolean('is_active').notNull().default(true),
		isFeatured: boolean('is_featured').notNull().default(false),
		sortOrder: int('sort_order').notNull().default(0),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [uniqueIndex('products_slug_unique').on(table.slug)]
);

export const productImages = mysqlTable('product_images', {
	id: int('id').autoincrement().primaryKey(),
	productId: int('product_id')
		.notNull()
		.references(() => products.id),
	url: varchar('url', { length: 500 }).notNull(),
	altText: varchar('alt_text', { length: 255 }),
	sortOrder: int('sort_order').notNull().default(0),
	isPrimary: boolean('is_primary').notNull().default(false)
});

export const productVariants = mysqlTable('product_variants', {
	id: int('id').autoincrement().primaryKey(),
	productId: int('product_id')
		.notNull()
		.references(() => products.id),
	name: varchar('name', { length: 100 }).notNull(),
	sku: varchar('sku', { length: 50 }),
	priceOverridePence: int('price_override_pence'),
	sortOrder: int('sort_order').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true)
});

// --- Quick-buy orders (pre-paid pickup, no cart-abandonment recovery yet) ---
//
// No payment provider is connected yet — orders are created with
// paymentStatus 'unpaid' and staff currently take payment in person at
// pickup. The intent is for a future payment step (e.g. Stripe Checkout) to
// slot in before order creation and flip paymentStatus to 'paid', without
// needing to change this shape.
export const orders = mysqlTable('orders', {
	id: int('id').autoincrement().primaryKey(),
	// Guest checkout is allowed — customerId is only set when the buyer was
	// logged in at checkout, guest* fields are always populated regardless
	// (so admin order lists never need to join out to a maybe-missing customer).
	customerId: int('customer_id').references(() => customers.id),
	guestName: varchar('guest_name', { length: 150 }).notNull(),
	guestEmail: varchar('guest_email', { length: 255 }).notNull(),
	guestPhone: varchar('guest_phone', { length: 50 }),
	// Free delivery is limited to Barrhead/Neilston (self-declared address, not
	// postcode-validated — staff eyeball it against the order list before the
	// pickup/delivery day, same trust level the rest of guest checkout runs on).
	// pickupDate is still the shared "which Friday/Saturday" field regardless
	// of method — a delivery still goes out on one of those two days.
	fulfilmentMethod: mysqlEnum('fulfilment_method', ['pickup', 'delivery'])
		.notNull()
		.default('pickup'),
	deliveryAddress: text('delivery_address'),
	pickupDate: date('pickup_date', { mode: 'string' }).notNull(),
	status: mysqlEnum('status', ['pending', 'ready', 'collected', 'cancelled'])
		.notNull()
		.default('pending'),
	paymentStatus: mysqlEnum('payment_status', ['unpaid', 'paid']).notNull().default('unpaid'),
	totalPence: int('total_pence').notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// Snapshots product/variant name and price at time of order — so a later
// price change or renamed/deleted product never rewrites history on an
// order that's already been placed.
export const orderItems = mysqlTable('order_items', {
	id: int('id').autoincrement().primaryKey(),
	orderId: int('order_id')
		.notNull()
		.references(() => orders.id),
	productId: int('product_id')
		.notNull()
		.references(() => products.id),
	variantId: int('variant_id').references(() => productVariants.id),
	productName: varchar('product_name', { length: 150 }).notNull(),
	variantName: varchar('variant_name', { length: 100 }),
	unitPricePence: int('unit_price_pence').notNull(),
	quantity: int('quantity').notNull(),
	subtotalPence: int('subtotal_pence').notNull()
});

export const ordersRelations = relations(orders, ({ many, one }) => ({
	items: many(orderItems),
	customer: one(customers, { fields: [orders.customerId], references: [customers.id] })
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, { fields: [orderItems.orderId], references: [orders.id] })
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products)
}));

export const productsRelations = relations(products, ({ one, many }) => ({
	category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
	images: many(productImages),
	variants: many(productVariants)
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
	product: one(products, { fields: [productImages.productId], references: [products.id] })
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
	product: one(products, { fields: [productVariants.productId], references: [products.id] })
}));

// --- Promotions (giveaways, community shout-outs, seasonal offers) ---

export const promotions = mysqlTable(
	'promotions',
	{
		id: int('id').autoincrement().primaryKey(),
		slug: varchar('slug', { length: 150 }).notNull(),
		title: varchar('title', { length: 200 }).notNull(),
		tagline: varchar('tagline', { length: 250 }),
		heroImageUrl: varchar('hero_image_url', { length: 500 }),
		introText: text('intro_text'),
		prizeDescription: text('prize_description'),
		areaText: varchar('area_text', { length: 150 }),
		deadlineText: varchar('deadline_text', { length: 150 }),
		ctaLabel: varchar('cta_label', { length: 100 }),
		ctaUrl: varchar('cta_url', { length: 500 }),
		isPublished: boolean('is_published').notNull().default(false),
		isFeaturedOnHomepage: boolean('is_featured_on_homepage').notNull().default(false),
		// 'manual' = the classic like/tag/share steps grid. 'business_picker' = the
		// local-business strip below, replacing the steps grid on that promotion's page.
		mechanic: mysqlEnum('mechanic', ['manual', 'business_picker']).notNull().default('manual'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [uniqueIndex('promotions_slug_unique').on(table.slug)]
);

export const promotionSteps = mysqlTable('promotion_steps', {
	id: int('id').autoincrement().primaryKey(),
	promotionId: int('promotion_id')
		.notNull()
		.references(() => promotions.id),
	label: varchar('label', { length: 100 }).notNull(),
	description: varchar('description', { length: 250 }).notNull(),
	sortOrder: int('sort_order').notNull().default(0)
});

export const promotionsRelations = relations(promotions, ({ many }) => ({
	steps: many(promotionSteps),
	businessChoices: many(businessChoices)
}));

export const promotionStepsRelations = relations(promotionSteps, ({ one }) => ({
	promotion: one(promotions, { fields: [promotionSteps.promotionId], references: [promotions.id] })
}));

// --- Local business picker (an alternate "mechanic" for a promotion — pick a
// local business to shout out once a day, entries reset Monday) ---

export const localBusinesses = mysqlTable('local_businesses', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 150 }).notNull(),
	category: varchar('category', { length: 100 }),
	description: text('description'),
	address: varchar('address', { length: 255 }),
	phone: varchar('phone', { length: 50 }),
	website: varchar('website', { length: 500 }),
	isActive: boolean('is_active').notNull().default(true),
	sortOrder: int('sort_order').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const businessChoices = mysqlTable(
	'business_choices',
	{
		id: int('id').autoincrement().primaryKey(),
		promotionId: int('promotion_id')
			.notNull()
			.references(() => promotions.id),
		customerId: int('customer_id')
			.notNull()
			.references(() => customers.id),
		businessId: int('business_id')
			.notNull()
			.references(() => localBusinesses.id),
		// A calendar date (not timestamp) — the natural key for "one pick per day."
		choiceDate: date('choice_date', { mode: 'string' }).notNull(),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('business_choices_promo_customer_date_unique').on(
			table.promotionId,
			table.customerId,
			table.choiceDate
		)
	]
);

export const localBusinessesRelations = relations(localBusinesses, ({ many }) => ({
	choices: many(businessChoices)
}));

export const businessChoicesRelations = relations(businessChoices, ({ one }) => ({
	promotion: one(promotions, {
		fields: [businessChoices.promotionId],
		references: [promotions.id]
	}),
	customer: one(customers, { fields: [businessChoices.customerId], references: [customers.id] }),
	business: one(localBusinesses, {
		fields: [businessChoices.businessId],
		references: [localBusinesses.id]
	})
}));

// --- Weekly menus (the "what's on this weekend" posts they currently do on Instagram) ---

export const weeklyMenus = mysqlTable(
	'weekly_menus',
	{
		id: int('id').autoincrement().primaryKey(),
		menuDate: date('menu_date', { mode: 'string' }).notNull(),
		title: varchar('title', { length: 200 }),
		openingHoursText: varchar('opening_hours_text', { length: 200 }),
		noteText: text('note_text'),
		isPublished: boolean('is_published').notNull().default(false),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [uniqueIndex('weekly_menus_menu_date_unique').on(table.menuDate)]
);

export const menuSections = mysqlTable('menu_sections', {
	id: int('id').autoincrement().primaryKey(),
	menuId: int('menu_id')
		.notNull()
		.references(() => weeklyMenus.id),
	title: varchar('title', { length: 150 }).notNull(),
	sortOrder: int('sort_order').notNull().default(0)
});

export const menuItems = mysqlTable('menu_items', {
	id: int('id').autoincrement().primaryKey(),
	sectionId: int('section_id')
		.notNull()
		.references(() => menuSections.id),
	name: varchar('name', { length: 150 }).notNull(),
	sortOrder: int('sort_order').notNull().default(0)
});

export const weeklyMenusRelations = relations(weeklyMenus, ({ many }) => ({
	sections: many(menuSections)
}));

export const menuSectionsRelations = relations(menuSections, ({ one, many }) => ({
	menu: one(weeklyMenus, { fields: [menuSections.menuId], references: [weeklyMenus.id] }),
	items: many(menuItems)
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
	section: one(menuSections, { fields: [menuItems.sectionId], references: [menuSections.id] })
}));

// --- Bespoke order enquiries + newsletter (from the contact page form) ---

export const bespokeOrderEnquiries = mysqlTable('bespoke_order_enquiries', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 150 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	phone: varchar('phone', { length: 50 }),
	details: text('details').notNull(),
	wantsNewsletter: boolean('wants_newsletter').notNull().default(false),
	status: mysqlEnum('status', ['new', 'contacted', 'archived']).notNull().default('new'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const newsletterSubscribers = mysqlTable(
	'newsletter_subscribers',
	{
		id: int('id').autoincrement().primaryKey(),
		email: varchar('email', { length: 255 }).notNull(),
		name: varchar('name', { length: 150 }),
		birthday: date('birthday', { mode: 'string' }),
		source: varchar('source', { length: 100 }),
		welcomeCodeRedeemedAt: timestamp('welcome_code_redeemed_at'),
		// One-click unsubscribe from an email footer link needs to work without
		// being logged in — a random token is the standard way to authorize that
		// single action safely. Nullable so the column can be added to existing
		// rows without a backfill migration; always set for new subscribers.
		unsubscribeToken: varchar('unsubscribe_token', { length: 64 }),
		subscribedAt: timestamp('subscribed_at').notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('newsletter_subscribers_email_unique').on(table.email),
		uniqueIndex('newsletter_subscribers_unsubscribe_token_unique').on(table.unsubscribeToken)
	]
);

// --- Newsletter campaigns (composed here, sent through an external email API) ---

export const newsletters = mysqlTable('newsletters', {
	id: int('id').autoincrement().primaryKey(),
	subject: varchar('subject', { length: 200 }).notNull(),
	preheader: varchar('preheader', { length: 200 }),
	heroImageUrl: varchar('hero_image_url', { length: 500 }),
	heading: varchar('heading', { length: 200 }).notNull(),
	intro: text('intro'),
	ctaLabel: varchar('cta_label', { length: 100 }),
	ctaUrl: varchar('cta_url', { length: 500 }),
	signOff: varchar('sign_off', { length: 200 }),
	status: mysqlEnum('status', ['draft', 'scheduled', 'sent']).notNull().default('draft'),
	scheduledFor: timestamp('scheduled_for'),
	sentAt: timestamp('sent_at'),
	recipientCount: int('recipient_count'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// A handful of promotional "cards" inside the newsletter — this week's menu,
// a current promotion, a bestseller — each with its own image/title/link.
export const newsletterHighlights = mysqlTable('newsletter_highlights', {
	id: int('id').autoincrement().primaryKey(),
	newsletterId: int('newsletter_id')
		.notNull()
		.references(() => newsletters.id),
	imageUrl: varchar('image_url', { length: 500 }),
	title: varchar('title', { length: 150 }).notNull(),
	description: varchar('description', { length: 300 }),
	linkUrl: varchar('link_url', { length: 500 }),
	sortOrder: int('sort_order').notNull().default(0)
});

export const newslettersRelations = relations(newsletters, ({ many }) => ({
	highlights: many(newsletterHighlights)
}));

export const newsletterHighlightsRelations = relations(newsletterHighlights, ({ one }) => ({
	newsletter: one(newsletters, {
		fields: [newsletterHighlights.newsletterId],
		references: [newsletters.id]
	})
}));

// Site-wide settings editable from admin. A single row (id 1) rather than a
// generic key/value table — there's only one setting so far and a real column
// per setting is simpler to work with than a KV store would be.
export const siteSettings = mysqlTable('site_settings', {
	id: int('id').autoincrement().primaryKey(),
	welcomeOfferCode: varchar('welcome_offer_code', { length: 50 }).notNull().default('TREAT CLUB'),
	welcomeOfferDescription: varchar('welcome_offer_description', { length: 255 })
		.notNull()
		.default('a free coffee or iced latte every month, plus a free bake on your birthday'),
	// The three overlapping photo cards in the homepage hero — null falls back
	// to the built-in placeholder illustrations, so an empty settings row still
	// renders a complete hero rather than a gap.
	heroImage1Url: varchar('hero_image_1_url', { length: 500 }),
	heroImage2Url: varchar('hero_image_2_url', { length: 500 }),
	heroImage3Url: varchar('hero_image_3_url', { length: 500 }),
	// The /bespoke-cakes page's own hero photo + copy — null image falls back
	// to no photo (a text-only hero) rather than a placeholder illustration,
	// since a generic cupcake graphic would undersell an actual cake photo.
	bespokeCakesImageUrl: varchar('bespoke_cakes_image_url', { length: 500 }),
	bespokeCakesHeading: varchar('bespoke_cakes_heading', { length: 200 })
		.notNull()
		.default("Bespoke cakes for your Smashin' occasion"),
	bespokeCakesIntro: text('bespoke_cakes_intro')
		.notNull()
		.default(
			'Birthdays, celebrations, anything worth marking with something a bit special — tell us what you have in mind and our baker Alanah will help bring it to life.'
		),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// Past cake photos shown in the gallery/slider on /bespoke-cakes — managed
// independently of the page's own hero photo above. Ordered by creation, so
// the most recently added design shows first.
export const bespokeCakeGalleryItems = mysqlTable('bespoke_cake_gallery_items', {
	id: int('id').autoincrement().primaryKey(),
	imageUrl: varchar('image_url', { length: 500 }).notNull(),
	caption: varchar('caption', { length: 200 }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// Customer quotes shown dotted throughout /bespoke-cakes rather than bunched
// into one testimonials block.
export const bespokeCakeTestimonials = mysqlTable('bespoke_cake_testimonials', {
	id: int('id').autoincrement().primaryKey(),
	quote: text('quote').notNull(),
	authorName: varchar('author_name', { length: 150 }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

// General-purpose image library — uploaded once here, then the URL is copied
// into whichever product/promotion/poster/etc field needs it. Separate from
// those entities' own per-record uploads, which stay as-is.
// Backs every /uploads/<folder>/<filename> URL — the folder+filename *is*
// the primary key, so saveUploadedImage's return value never has to change
// regardless of where the bytes actually live.
export const uploadedFiles = mysqlTable('uploaded_files', {
	path: varchar('path', { length: 255 }).primaryKey(),
	contentType: varchar('content_type', { length: 100 }).notNull(),
	data: longblob('data').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const mediaLibraryItems = mysqlTable('media_library_items', {
	id: int('id').autoincrement().primaryKey(),
	url: varchar('url', { length: 500 }).notNull(),
	filename: varchar('filename', { length: 255 }).notNull(),
	altText: varchar('alt_text', { length: 255 }),
	uploadedAt: timestamp('uploaded_at').notNull().defaultNow()
});

// --- Posters (swappable homepage announcement/CTA blocks) ---

export const posters = mysqlTable('posters', {
	id: int('id').autoincrement().primaryKey(),
	eyebrow: varchar('eyebrow', { length: 100 }),
	heading: varchar('heading', { length: 200 }).notNull(),
	message: text('message').notNull(),
	// One perk per line, shown as a two-column checklist under a dotted divider
	// (a la a loyalty-club card) — omitted entirely when left blank so plain
	// announcement/sold-out posters aren't forced to have a perks section.
	perks: text('perks'),
	imageUrl: varchar('image_url', { length: 500 }),
	imageZoom: int('image_zoom').notNull().default(100),
	style: mysqlEnum('style', ['announcement', 'sold-out', 'celebration', 'general'])
		.notNull()
		.default('general'),
	ctaLabel: varchar('cta_label', { length: 100 }),
	ctaUrl: varchar('cta_url', { length: 500 }),
	isActive: boolean('is_active').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

// --- Customer accounts (separate from staff auth) ---

export const customers = mysqlTable(
	'customers',
	{
		id: int('id').autoincrement().primaryKey(),
		email: varchar('email', { length: 255 }).notNull(),
		passwordHash: varchar('password_hash', { length: 255 }).notNull(),
		name: varchar('name', { length: 150 }).notNull(),
		marketingOptIn: boolean('marketing_opt_in').notNull().default(false),
		// Same one-click-unsubscribe purpose as newsletterSubscribers.unsubscribeToken.
		unsubscribeToken: varchar('unsubscribe_token', { length: 64 }),
		// Self-service "forgot password" — sha256 hash of a one-time token (the
		// raw token only ever lives in the emailed link), cleared on use or once
		// it expires. Null when there's no reset in progress.
		passwordResetTokenHash: varchar('password_reset_token_hash', { length: 64 }),
		passwordResetExpiresAt: timestamp('password_reset_expires_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [
		uniqueIndex('customers_email_unique').on(table.email),
		uniqueIndex('customers_unsubscribe_token_unique').on(table.unsubscribeToken)
	]
);

export const customerSessions = mysqlTable('customer_sessions', {
	id: varchar('id', { length: 64 }).primaryKey(), // sha256 hex of the session token
	customerId: int('customer_id')
		.notNull()
		.references(() => customers.id),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const customerSessionsRelations = relations(customerSessions, ({ one }) => ({
	customer: one(customers, { fields: [customerSessions.customerId], references: [customers.id] })
}));

// --- Flavour voting (weekly poll, entries double as a prize-draw list) ---

export const flavorPolls = mysqlTable('flavor_polls', {
	id: int('id').autoincrement().primaryKey(),
	title: varchar('title', { length: 200 }).notNull(),
	description: text('description'),
	prizeDescription: text('prize_description'),
	deadlineText: varchar('deadline_text', { length: 150 }),
	isActive: boolean('is_active').notNull().default(false),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

export const flavorPollOptions = mysqlTable('flavor_poll_options', {
	id: int('id').autoincrement().primaryKey(),
	pollId: int('poll_id')
		.notNull()
		.references(() => flavorPolls.id),
	name: varchar('name', { length: 100 }).notNull(),
	sortOrder: int('sort_order').notNull().default(0)
});

export const flavorPollVotes = mysqlTable(
	'flavor_poll_votes',
	{
		id: int('id').autoincrement().primaryKey(),
		pollId: int('poll_id')
			.notNull()
			.references(() => flavorPolls.id),
		customerId: int('customer_id')
			.notNull()
			.references(() => customers.id),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('flavor_poll_votes_poll_customer_unique').on(table.pollId, table.customerId)
	]
);

export const flavorPollVoteSelections = mysqlTable('flavor_poll_vote_selections', {
	id: int('id').autoincrement().primaryKey(),
	voteId: int('vote_id')
		.notNull()
		.references(() => flavorPollVotes.id),
	optionId: int('option_id')
		.notNull()
		.references(() => flavorPollOptions.id)
});

export const flavorPollsRelations = relations(flavorPolls, ({ many }) => ({
	options: many(flavorPollOptions),
	votes: many(flavorPollVotes)
}));

export const flavorPollOptionsRelations = relations(flavorPollOptions, ({ one }) => ({
	poll: one(flavorPolls, { fields: [flavorPollOptions.pollId], references: [flavorPolls.id] })
}));

export const flavorPollVotesRelations = relations(flavorPollVotes, ({ one, many }) => ({
	poll: one(flavorPolls, { fields: [flavorPollVotes.pollId], references: [flavorPolls.id] }),
	customer: one(customers, { fields: [flavorPollVotes.customerId], references: [customers.id] }),
	selections: many(flavorPollVoteSelections)
}));

export const flavorPollVoteSelectionsRelations = relations(flavorPollVoteSelections, ({ one }) => ({
	vote: one(flavorPollVotes, {
		fields: [flavorPollVoteSelections.voteId],
		references: [flavorPollVotes.id]
	}),
	option: one(flavorPollOptions, {
		fields: [flavorPollVoteSelections.optionId],
		references: [flavorPollOptions.id]
	})
}));

// --- Staff auth (separate from customer auth) ---

export const staffUsers = mysqlTable(
	'staff_users',
	{
		id: int('id').autoincrement().primaryKey(),
		email: varchar('email', { length: 255 }).notNull(),
		passwordHash: varchar('password_hash', { length: 255 }).notNull(),
		name: varchar('name', { length: 150 }).notNull(),
		role: mysqlEnum('role', ['admin', 'staff']).notNull().default('staff'),
		isActive: boolean('is_active').notNull().default(true),
		// Locks this account against every staff-management action taken by
		// anyone else — including other admins. There's deliberately no form
		// field anywhere that sets this; it's only ever flipped by hand
		// directly in the database, so no admin (including a compromised one)
		// can grant it to themselves or strip it from the protected account.
		isProtected: boolean('is_protected').notNull().default(false),
		failedLoginAttempts: int('failed_login_attempts').notNull().default(0),
		lockedUntil: timestamp('locked_until'),
		// Self-service "forgot password" — same pattern as customers.*, a sha256
		// hash of a one-time emailed token, cleared on use or once it expires.
		passwordResetTokenHash: varchar('password_reset_token_hash', { length: 64 }),
		passwordResetExpiresAt: timestamp('password_reset_expires_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [uniqueIndex('staff_users_email_unique').on(table.email)]
);

// Login/logout and staff-account-management history. Deliberately has no
// foreign keys to staff_users: an audit trail needs to survive the actor or
// target account later being deleted, so actor/target are plain nullable ids
// plus an email snapshot captured at the time, not a live join.
export const staffActivityLog = mysqlTable('staff_activity_log', {
	id: int('id').autoincrement().primaryKey(),
	action: mysqlEnum('action', [
		'login_success',
		'login_failed',
		'logout',
		'staff_created',
		'staff_updated',
		'staff_role_changed',
		'staff_activated',
		'staff_deactivated',
		'staff_deleted',
		'password_changed_self',
		'password_reset_by_admin',
		'password_reset_requested',
		'password_reset_completed'
	]).notNull(),
	actorStaffUserId: int('actor_staff_user_id'),
	actorEmail: varchar('actor_email', { length: 255 }),
	targetStaffUserId: int('target_staff_user_id'),
	targetEmail: varchar('target_email', { length: 255 }),
	detail: varchar('detail', { length: 500 }),
	ipAddress: varchar('ip_address', { length: 64 }),
	userAgent: varchar('user_agent', { length: 255 }),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const staffSessions = mysqlTable('staff_sessions', {
	id: varchar('id', { length: 64 }).primaryKey(), // sha256 hex of the session token
	staffUserId: int('staff_user_id')
		.notNull()
		.references(() => staffUsers.id),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const staffSessionsRelations = relations(staffSessions, ({ one }) => ({
	staffUser: one(staffUsers, { fields: [staffSessions.staffUserId], references: [staffUsers.id] })
}));
