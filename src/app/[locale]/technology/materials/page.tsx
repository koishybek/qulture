import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, localizePath, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

type MaterialsCopy = {
  metadataTitle: string;
  lead: string;
  sourceTitle: string;
  sourceBody: string;
  statusTitle: string;
  statusBody: string;
  backLabel: string;
};

const materialsCopy: Record<Locale, MaterialsCopy> = {
  en: {
    metadataTitle: "Materials — verification process",
    lead: "Composition, properties and care guidance are published after supplier confirmation and team review.",
    sourceTitle: "From source document to product page",
    sourceBody:
      "Every fabric needs a data source, an owner within the team, a version and a date for the next review. Working hypotheses do not become customer promises.",
    statusTitle: "Specifications are not published yet",
    statusBody:
      "The pre-launch version does not invent composition, membranes, water resistance or a temperature range. Those details appear only for an approved product.",
    backLabel: "Back to the approach",
  },
  ru: {
    metadataTitle: "Материалы — процесс подтверждения",
    lead: "Состав, свойства и рекомендации по уходу публикуются после подтверждения поставщиком и проверки командой.",
    sourceTitle: "От документа к карточке товара",
    sourceBody:
      "Для каждой ткани нужны источник данных, владелец внутри команды, версия и дата следующей проверки. Рабочие гипотезы не становятся потребительскими обещаниями.",
    statusTitle: "Характеристики ещё не опубликованы",
    statusBody:
      "В pre-launch версии нет выдуманного состава, мембраны, водостойкости или температурного диапазона. Они появятся только для утверждённого товара.",
    backLabel: "Назад к подходу",
  },
  kz: {
    metadataTitle: "Материалдар — растау үдерісі",
    lead: "Құрам, қасиеттер және күтім нұсқаулары жеткізуші растағаннан және команда тексергеннен кейін жарияланады.",
    sourceTitle: "Құжаттан өнім картасына дейін",
    sourceBody:
      "Әр матаға дерек көзі, команда ішіндегі жауапты адам, нұсқа және келесі тексеру күні қажет. Жұмыс болжамдары тұтынушыға берілетін уәдеге айналмайды.",
    statusTitle: "Сипаттамалар әлі жарияланған жоқ",
    statusBody:
      "Pre-launch нұсқасында ойдан шығарылған құрам, мембрана, суға төзімділік немесе температура ауқымы жоқ. Олар тек бекітілген өнімге қосылады.",
    backLabel: "Тәсілге оралу",
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: materialsCopy[locale].metadataTitle,
    robots: { index: true, follow: true },
  };
}

export default async function MaterialsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = materialsCopy[locale];

  return (
    <article className="q-page">
      <header className="q-page-header">
        <p className="q-meta">TECHNOLOGY / MATERIALS</p>
        <h1 className="q-display q-display--medium">
          MATERIALS,
          <br />
          WITH EVIDENCE.
        </h1>
        <p className="q-lead">{copy.lead}</p>
      </header>
      <div className="q-page-body content-sections">
        <section>
          <p className="q-meta">01 / SOURCE</p>
          <h2>{copy.sourceTitle}</h2>
          <p>{copy.sourceBody}</p>
        </section>
        <section>
          <p className="q-meta">02 / CURRENT STATUS</p>
          <h2>{copy.statusTitle}</h2>
          <p>{copy.statusBody}</p>
        </section>
        <Link className="q-button" href={localizePath(locale, "/technology")}>
          {copy.backLabel} →
        </Link>
      </div>
    </article>
  );
}
