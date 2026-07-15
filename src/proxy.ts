import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  DOCUMENT_LANGUAGE_HEADER,
  documentLanguageFromPathname,
} from "@/lib/i18n/document-language";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    DOCUMENT_LANGUAGE_HEADER,
    documentLanguageFromPathname(request.nextUrl.pathname),
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/ru/:path*", "/kz/:path*", "/admin/:path*"],
};
