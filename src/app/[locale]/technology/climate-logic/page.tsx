import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, localizePath, type Locale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

type ClimateStep = readonly [number: string, title: string, body: string];

type ClimateLogicCopy = {
  metadataTitle: string;
  lead: string;
  backLabel: string;
  steps: readonly ClimateStep[];
};

const climateLogicCopy: Record<Locale, ClimateLogicCopy> = {
  en: {
    metadataTitle: "Changing climate logic",
    lead:
      "A changing climate is not a marketing temperature range. It is the transition between environments over the course of one day.",
    backLabel: "Back to the approach",
    steps: [
      ["01", "Route", "Street, car, public transport and interior are treated as one sequence."],
      ["02", "Layers", "The system should work alone, with a base layer and under outerwear — after real-world validation."],
      ["03", "Movement", "Fit is assessed through city movement, not only in a still photograph."],
      ["04", "Publication", "A scenario becomes guidance only with its limits and a source of data."],
    ],
  },
  ru: {
    metadataTitle: "Логика меняющегося климата",
    lead:
      "Меняющийся климат — это не маркетинговый диапазон температур, а переходы между средами в течение одного дня.",
    backLabel: "Назад к подходу",
    steps: [
      ["01", "Маршрут", "Улица, автомобиль, транспорт и помещение рассматриваются как одна последовательность."],
      ["02", "Слои", "Система должна работать соло, с базовым слоем и под верхней одеждой — после реальной проверки."],
      ["03", "Движение", "Посадку оценивают в действиях города, а не только в статичной фотографии."],
      ["04", "Публикация", "Сценарий становится рекомендацией только вместе с ограничениями и источником данных."],
    ],
  },
  kz: {
    metadataTitle: "Құбылмалы климат логикасы",
    lead:
      "Құбылмалы климат — маркетингтік температура ауқымы емес, бір күн ішіндегі орталар арасындағы ауысу.",
    backLabel: "Тәсілге оралу",
    steps: [
      ["01", "Бағыт", "Көше, автокөлік, қоғамдық көлік және ғимарат бір тізбек ретінде қарастырылады."],
      ["02", "Қабаттар", "Жүйе жеке, негізгі қабатпен және сыртқы киім астында — нақты тексеруден кейін жұмыс істеуі керек."],
      ["03", "Қозғалыс", "Пішім тек статикалық фотода емес, қала әрекеттерінде бағаланады."],
      ["04", "Жариялау", "Сценарий шектеулер мен дерек көзі бірге болғанда ғана ұсынысқа айналады."],
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: climateLogicCopy[locale].metadataTitle };
}

export default async function ClimateLogicPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const copy = climateLogicCopy[locale];

  return (
    <article className="q-page">
      <header className="q-page-header">
        <p className="q-meta">TECHNOLOGY / CLIMATE LOGIC</p>
        <h1 className="q-display q-display--medium">
          FROM STREET
          <br />
          TO INSIDE.
        </h1>
        <p className="q-lead">{copy.lead}</p>
      </header>
      <div className="q-page-body">
        <ol className="proof-list">
          {copy.steps.map(([number, title, body]) => (
            <li key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ol>
        <Link className="q-button" href={localizePath(locale, "/technology")}>
          {copy.backLabel} →
        </Link>
      </div>
    </article>
  );
}
