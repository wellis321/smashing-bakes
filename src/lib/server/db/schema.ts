import {
	mysqlTable,
	int,
	varchar,
	text,
	boolean,
	timestamp,
	date,
	mysqlEnum,
	uniqueIndex
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

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
	steps: many(promotionSteps)
}));

export const promotionStepsRelations = relations(promotionSteps, ({ one }) => ({
	promotion: one(promotions, { fields: [promotionSteps.promotionId], references: [promotions.id] })
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
		source: varchar('source', { length: 100 }),
		subscribedAt: timestamp('subscribed_at').notNull().defaultNow()
	},
	(table) => [uniqueIndex('newsletter_subscribers_email_unique').on(table.email)]
);

// --- Posters (swappable homepage announcement/CTA blocks) ---

export const posters = mysqlTable('posters', {
	id: int('id').autoincrement().primaryKey(),
	heading: varchar('heading', { length: 200 }).notNull(),
	message: text('message').notNull(),
	imageUrl: varchar('image_url', { length: 500 }),
	imageZoom: int('image_zoom').notNull().default(100),
	style: mysqlEnum('style', ['announcement', 'sold-out', 'celebration', 'general']).notNull().default('general'),
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
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [uniqueIndex('customers_email_unique').on(table.email)]
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
	(table) => [uniqueIndex('flavor_poll_votes_poll_customer_unique').on(table.pollId, table.customerId)]
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
	vote: one(flavorPollVotes, { fields: [flavorPollVoteSelections.voteId], references: [flavorPollVotes.id] }),
	option: one(flavorPollOptions, { fields: [flavorPollVoteSelections.optionId], references: [flavorPollOptions.id] })
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
		failedLoginAttempts: int('failed_login_attempts').notNull().default(0),
		lockedUntil: timestamp('locked_until'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow()
	},
	(table) => [uniqueIndex('staff_users_email_unique').on(table.email)]
);

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
