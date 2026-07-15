import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: locale === "ru" ? "Логика меняющегося климата" : "Құбылмалы климат логикасы" };
}

export default async function ClimateLogicPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const isRu = locale === "ru";
  const steps = isRu
    ? [["01", "Маршрут", "Улица, автомобиль, транспорт и помещение рассматриваются как одна последовательность."], ["02", "Слои", "Система должна работать соло, с базовым слоем и под верхней одеждой — после реальной проверки."], ["03", "Движение", "Посадку оценивают в действиях города, а не только в статичной фотографии."], ["04", "Публикация", "Сценарий становится рекомендацией только вместе с ограничениями и источником данных."]]
    : [["01", "Бағыт", "Көше, автокөлік, қоғамдық көлік және ғимарат бір тізбек ретінде қарастырылады."], ["02", "Қабаттар", "Жүйе жеке, негізгі қабатпен және сыртқы киім астында — нақты тексеруден кейін жұмыс істеуі керек."], ["03", "Қозғалыс", "Пішім тек статикалық фотода емес, қала әрекеттерінде бағаланады."], ["04", "Жариялау", "Сценарий шектеулер мен дерек көзі бірге болғанда ғана ұсынысқа айналады."]];
  return (
    <article className="q-page">
      <header className="q-page-header"><p className="q-meta">TECHNOLOGY / CLIMATE LOGIC</p><h1 className="q-display q-display--medium">FROM STREET<br />TO INSIDE.</h1><p className="q-lead">{isRu ? "Меняющийся климат — это не маркетинговый диапазон температур, а переходы между средами в течение одного дня." : "Құбылмалы климат — маркетингтік температура ауқымы емес, бір күн ішіндегі орталар арасындағы ауысу."}</p></header>
      <div className="q-page-body"><ol className="proof-list">{steps.map(([number, title, body]) => <li key={number}><span>{number}</span><strong>{title}</strong><p>{body}</p></li>)}</ol><Link className="q-button" href={`/${locale}/technology`}>{isRu ? "Назад к подходу" : "Тәсілге оралу"} →</Link></div>
    </article>
  );
}
