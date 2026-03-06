import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const location = await prisma.location.findFirst({
      where: { id, deletedAt: null },
      select: { name: true, nameEn: true, shortDesc: true, shortDescEn: true },
    });
    if (!location)
      return { title: "Lokasyon bulunamadı | Dijital Kaşif" };
    const title = `${location.name} | Dijital Kaşif`;
    const description =
      location.shortDesc || location.shortDescEn || location.name;
    return {
      title,
      description: description.slice(0, 160),
      openGraph: { title, description },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch {
    return { title: "Dijital Kaşif" };
  }
}

export default function LocationDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
