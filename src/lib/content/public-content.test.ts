import { describe, expect, it } from "vitest";

import type { FaqPage, LegalPage } from "@/content/types";
import { mergeManagedFaqPage, mergeManagedLegalPage } from "./public-content";

const legalFallback: LegalPage = {
  seo: { title: "Static SEO", description: "Static description" },
  eyebrow: "PRIVACY / DRAFT",
  title: "Static title",
  lead: "Static lead",
  status: "Draft",
  legalStatus: {
    label: "Legal draft",
    message: "Not approved",
    version: "DRAFT 1",
    effectiveLabel: "Not effective",
  },
  sections: [{ id: "scope", title: "Scope", paragraphs: ["Static paragraph"] }],
};

const faqFallback: FaqPage = {
  seo: { title: "FAQ", description: "Static FAQ" },
  eyebrow: "FAQ",
  title: "Questions",
  lead: "Static lead",
  sections: [],
  items: [{ id: "launch", question: "When?", answer: ["Not confirmed."] }],
};

describe("public CMS content", () => {
  it("uses published managed copy without removing the static legal warning", () => {
    const page = mergeManagedLegalPage(legalFallback, [{
      slug: "privacy",
      title: "Managed privacy title",
      excerpt: "Managed lead",
      content: JSON.stringify({
        sections: [{ id: "data", title: "Managed section", paragraphs: ["React escapes this <script>alert(1)</script> text."] }],
      }),
      requiresApproval: false,
      seoTitle: "Managed SEO",
      seoDescription: null,
      version: 3,
    }], [], ["privacy"]);

    expect(page.title).toBe("Managed privacy title");
    expect(page.sections[0]?.title).toBe("Managed section");
    expect(page.sections[0]?.paragraphs[0]).toContain("<script>");
    expect(page.legalStatus).toEqual(legalFallback.legalStatus);
    expect(page.seo).toEqual({ title: "Managed SEO", description: "Managed lead" });
  });

  it("keeps the static draft when no managed record exists and overlays known translations", () => {
    const page = mergeManagedLegalPage(legalFallback, [], [
      { namespace: "page.privacy", key: "title", value: "Translated title" },
      { namespace: "page.privacy", key: "section.scope.paragraphs", value: '["Translated paragraph"]' },
    ], ["privacy"]);

    expect(page.title).toBe("Translated title");
    expect(page.sections[0]?.paragraphs).toEqual(["Translated paragraph"]);
    expect(page.legalStatus.label).toBe("Legal draft");
  });

  it("falls back entirely when structured managed content is malformed", () => {
    const page = mergeManagedLegalPage(legalFallback, [{
      slug: "privacy",
      title: "Must not leak into public output",
      excerpt: "Malformed managed lead",
      content: JSON.stringify({ sections: [{ title: "Missing paragraphs" }] }),
      requiresApproval: true,
      seoTitle: "Malformed SEO",
      seoDescription: null,
      version: 1,
    }], [], ["privacy"]);

    expect(page).toEqual(legalFallback);
  });

  it("turns structured managed FAQ items into public questions", () => {
    const page = mergeManagedFaqPage(faqFallback, [{
      slug: "faq",
      title: "Managed FAQ",
      excerpt: "Current answers",
      content: JSON.stringify({ items: [{ id: "sizes", question: "Sizes?", answer: ["Only approved charts are published."] }] }),
      requiresApproval: true,
      seoTitle: null,
      seoDescription: null,
      version: 2,
    }], [
      { namespace: "page.faq", key: "item.sizes.question", value: "Which sizes?" },
    ], ["faq"]);

    expect(page.title).toBe("Managed FAQ");
    expect(page.items).toEqual([{ id: "sizes", question: "Which sizes?", answer: ["Only approved charts are published."], links: [] }]);
  });
});
