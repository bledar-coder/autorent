import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // run on everything except api routes, next internals and static files
  matcher: ["/", "/(sq|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
