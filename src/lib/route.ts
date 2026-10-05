/**
 * The site has only a few pages, so routing is just the URL path at load time –
 * moving between pages is a normal link. Render must rewrite unknown paths to
 * /index.html for /books to load directly (see Redirects/Rewrites in Render).
 */
export const PATH = window.location.pathname.replace(/\/+$/, '') || '/'

export const IS_HOME = PATH === '/'

/** A link to a home-page section that also works from other pages. */
export const sectionHref = (hash: string) => (IS_HOME ? hash : `/${hash}`)
