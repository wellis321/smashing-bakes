// The cart lives entirely in localStorage on the client — there's nothing
// for the server to render here, and SSR-ing an always-empty cart would
// just flash "your cart is empty" before hydration corrects it.
export const ssr = false;
