// Photos uploaded through the admin live at /uploads/... and can be asked for
// at a smaller size with ?w=<pixels> (the server makes and caches a compressed
// WebP copy). Anything else (static pictures, other sites) is left untouched.
export const IMAGE_WIDTHS = [160, 320, 480, 640, 960, 1280, 1600] as const;

export function isResizable(url: string | null | undefined): url is string {
	return !!url && url.startsWith('/uploads/') && !url.includes('?');
}

export function srcFor(url: string, width = 640): string {
	return isResizable(url) ? `${url}?w=${width}` : url;
}

export function srcsetFor(
	url: string | null | undefined,
	widths: number[] = [320, 480, 640, 960, 1280]
): string | undefined {
	if (!isResizable(url)) return undefined;
	return widths.map((w) => `${url}?w=${w} ${w}w`).join(', ');
}
