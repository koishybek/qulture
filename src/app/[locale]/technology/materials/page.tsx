import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: locale === "ru" ? "Материалы — процесс подтверждения" : "Материалдар — растау үдерісі", robots: { index: true, follow: true } };
}

export default async function MaterialsPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const isRu = locale === "ru";
  return (
    <article className="q-page">
      <header className="q-page-header"><p className="q-meta">TECHNOLOGY / MATERIALS</p><h1 className="q-display q-display--medium">MATERIALS,<br />WITH EVIDENCE.</h1><p className="q-lead">{isRu ? "Состав, свойства и рекомендации по уходу публикуются после подтверждения поставщиком и проверки командой." : "Құрам, қасиеттер және күтім нұсқаулары жеткізуші растағаннан және команда тексергеннен кейін жарияланады."}</p></header>
      <div className="q-page-body content-sections">
        <section><p className="q-meta">01 / SOURCE</p><h2>{isRu ? "От документа к карточке товара" : "Құжаттан өнім картасына дейін"}</h2><p>{isRu ? "Для каждой ткани нужны источник данных, владелец внутри команды, версия и дата следующей проверки. Рабочие гипотезы не становятся потребительскими обещаниями." : "Әр матаға дерек көзі, команда ішіндегі жауапты адам, нұсқа және келесі тексеру күні қажет. Жұмыс болжамдары тұтынушыға берілетін уәдеге айналмайды."}</p></section>
        <section><p className="q-meta">02 / CURRENT STATUS</p><h2>{isRu ? "Характеристики ещё не опубликованы" : "Сипаттамалар әлі жарияланған жоқ"}</h2><p>{isRu ? "В pre-launch версии нет выдуманного состава, мембраны, водостойкости или температурного диапазона. Они появятся только для утверждённого товара." : "Pre-launch нұсқасында ойдан шығарылған құрам, мембрана, суға төзімділік немесе температура ауқымы жоқ. Олар тек бекітілген өнімге қосылады."}</p></section>
        <Link className="q-button" href={`/${locale}/technology`}>{isRu ? "Назад к подходу" : "Тәсілге оралу"} →</Link>
      </div>
    </article>
  );
}
