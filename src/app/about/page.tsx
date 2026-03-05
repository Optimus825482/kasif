"use client";

import { useLocale } from "@/context/locale-context";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Users,
  BarChart3,
  Globe,
  GraduationCap,
  BookOpen,
  Building2,
  Lightbulb,
  Navigation,
  Layers,
  Eye,
  Bus,
  ExternalLink,
} from "lucide-react";

export default function AboutPage() {
  const { locale } = useLocale();
  const isTr = locale === "tr";

  const features = [
    {
      icon: Navigation,
      step: 1,
      title: isTr ? "Konum İzni" : "Location Permission",
      desc: isTr
        ? "Tarayıcı üzerinden anlık konum algılama ve harita odaklama."
        : "Real-time location detection via browser and map centering.",
    },
    {
      icon: MapPin,
      step: 2,
      title: isTr ? "Akıllı İşaretçiler" : "Smart Markers",
      desc: isTr
        ? "5km yarıçapındaki tarihi ve turistik mekanların Leaflet.js ile işaretlenmesi."
        : "Marking historical and touristic venues within 5km radius using Leaflet.js.",
    },
    {
      icon: Layers,
      step: 3,
      title: isTr ? "Özet Bilgi" : "Summary Info",
      desc: isTr
        ? "Mekan adı, kısa tarihçe ve anlık uzaklık gösteren Bottom Sheet."
        : "Bottom sheet showing venue name, brief history and real-time distance.",
    },
    {
      icon: Eye,
      step: 4,
      title: isTr ? "Detay Sayfası" : "Detail Page",
      desc: isTr
        ? "Yüksek çözünürlüklü görseller, sesli rehber ve erişilebilirlik verileri."
        : "High-resolution images, audio guide and accessibility data.",
    },
    {
      icon: Bus,
      step: 5,
      title: isTr ? "Çoklu Navigasyon" : "Multi Navigation",
      desc: isTr
        ? "Yaya, araç ve dinamik toplu taşıma rotaları."
        : "Walking, driving and dynamic public transit routes.",
    },
    {
      icon: BarChart3,
      step: 6,
      title: isTr ? "Akıllı Analitik" : "Smart Analytics",
      desc: isTr
        ? "Anonim kullanım verileriyle turizm planlaması ve karar destek."
        : "Tourism planning and decision support with anonymous usage data.",
    },
  ];

  const expertise = [
    {
      icon: Building2,
      color: "#3b82f6",
      title: isTr ? "Yerel Yönetimler" : "Local Governance",
      desc: isTr
        ? "Belediyelerin iç kontrol sistemleri, kapasite geliştirme ve stratejik yönetim modelleri."
        : "Municipal internal control systems, capacity building and strategic management models.",
    },
    {
      icon: Globe,
      color: "#8b5cf6",
      title: isTr ? "Akıllı Şehirler" : "Smart Cities",
      desc: isTr
        ? "Amsterdam modeli üzerinden akıllı turizm ve teknolojik kentsel altyapı uygulamaları."
        : "Smart tourism and technological urban infrastructure based on the Amsterdam model.",
    },
    {
      icon: Lightbulb,
      color: "#10b981",
      title: isTr ? "Sürdürülebilirlik" : "Sustainability",
      desc: isTr
        ? "Eko-yenilik, çevre yönetim muhasebesi ve otel endüstrisinde yeşil dinamik uyum."
        : "Eco-innovation, environmental management accounting and green dynamic alignment in hospitality.",
    },
    {
      icon: Users,
      color: "#f97316",
      title: isTr ? "Kalabalık Yönetimi" : "Crowd Management",
      desc: isTr
        ? "Aşırı turizmde teknoloji ve kapasite destekli destinasyon planlaması."
        : "Technology and capacity-supported destination planning in overtourism.",
    },
  ];

  const publications = [
    {
      title: isTr
        ? "Belediyelerin Genişleyen Ekosistemleri Üzerine Disiplinlerarası Çalışmalar"
        : "Interdisciplinary Studies on Expanding Ecosystems of Municipalities",
      role: isTr
        ? "Editör (2021) • Nobel Akademik"
        : "Editor (2021) • Nobel Academic",
      color: "text-blue-600",
    },
    {
      title: isTr
        ? "Akıllı Şehir: Belediyeler İçin Amsterdam Deneyiminden Uygulama Örnekleri"
        : "Smart City: Implementation Examples from the Amsterdam Experience for Municipalities",
      role: isTr ? "Yazar • Nobel Akademik" : "Author • Nobel Academic",
      color: "text-emerald-600",
    },
    {
      title: isTr
        ? "Otel Endüstrisinde Sürdürülebilirlik: Çevreci Uygulamaların Performansa Etkisi"
        : "Sustainability in Hotel Industry: Impact of Green Practices on Performance",
      role: "Sustainability (Q1), 2025",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="container max-w-4xl mx-auto px-4 py-10 md:py-24 text-center relative z-10">
            <Image
              src="/logo.png"
              alt="Akıllı Kent Turizm Rehberi"
              width={120}
              height={120}
              className="mx-auto mb-6 drop-shadow-lg"
            />
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm font-medium mb-6 border border-white/20">
              {isTr
                ? "PWA Tabanlı Akıllı Şehir Ekosistemi"
                : "PWA-Based Smart City Ecosystem"}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
              {isTr ? "Akıllı Kent Turizm Rehberi" : "Smart City Tourism Guide"}
            </h1>
            <p className="text-base md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
              {isTr
                ? "Yerel yönetimlerde dijitalleşme ve sürdürülebilirlik vizyonuyla, turistlerin kenti akıllıca keşfetmesini sağlayan yenilikçi platform."
                : "An innovative platform enabling tourists to explore the city smartly, with a vision of digitalization and sustainability in local governance."}
            </p>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-6 py-4 border border-white/20">
                <Lightbulb className="h-5 w-5 text-yellow-300" />
                <div className="text-left">
                  <p className="text-xs text-blue-200 uppercase tracking-wider font-medium">
                    {isTr ? "Akademik Vizyoner" : "Academic Visionary"}
                  </p>
                  <p className="font-bold text-lg">
                    Doç. Dr. Onur Kemal Yılmaz
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Experience Flow */}
        <section className="container max-w-5xl mx-auto px-4 py-10 md:py-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {isTr
                ? "Kullanıcı Deneyimi ve Sistem Akışı"
                : "User Experience & System Flow"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isTr
                ? "Proje, ziyaretçilerin Balıkesir'in tarihi ve doğal güzelliklerine erişimini kesintisiz bir PWA deneyimi ile sunar."
                : "The project offers visitors seamless access to Balıkesir's historical and natural beauties through a PWA experience."}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {features.map((f) => (
              <Card
                key={f.step}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950 flex items-center justify-center mx-auto mb-2">
                    <f.icon className="h-4 w-4 text-teal-600" />
                  </div>
                  <p className="text-xs font-bold text-teal-600 mb-1">
                    {f.step}.
                  </p>
                  <h3 className="font-semibold text-xs mb-1">{f.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Academic Visionary Section */}
        <section className="container max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              <GraduationCap className="h-4 w-4" />
              {isTr ? "Akademik Vizyoner" : "Academic Visionary"}
            </div>
            <h2 className="text-3xl font-bold mb-3">
              Doç. Dr. Onur Kemal Yılmaz
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isTr
                ? "Burhaniye Uygulamalı Bilimler Fakültesi"
                : "Burhaniye Faculty of Applied Sciences"}
            </p>
          </div>

          {/* Bio Card */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 border border-white/20">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {isTr
                      ? "Yerel Yönetimler ve Kamu Yönetimi Uzmanı"
                      : "Local Governance & Public Administration Expert"}
                  </h3>
                  <p className="text-blue-100 leading-relaxed">
                    {isTr
                      ? 'Doç. Dr. Yılmaz, geleneksel Kamu Yönetimi kuramlarını modern teknolojiler (Akıllı Şehirler, Toplum 5.0) ve işletme-turizm pratikleriyle (Stratejik Kapasite, Eko-İnovasyon) harmanlayan, yerel yönetimlere disiplinlerarası bir "ekosistem" penceresinden bakan vizyoner bir araştırmacıdır.'
                      : 'Assoc. Prof. Yılmaz is a visionary researcher who blends traditional Public Administration theories with modern technologies (Smart Cities, Society 5.0) and business-tourism practices (Strategic Capacity, Eco-Innovation), viewing local governance through an interdisciplinary "ecosystem" lens.'}
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-2xl font-bold text-blue-600">2018</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isTr
                      ? "Doktora — Marmara Üniversitesi"
                      : "PhD — Marmara University"}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-2xl font-bold text-purple-600">2015</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isTr
                      ? "Y. Lisans — İstanbul Üniversitesi"
                      : "MSc — Istanbul University"}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-2xl font-bold text-teal-600">2012</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isTr
                      ? "Lisans — Anadolu Üniversitesi"
                      : "BSc — Anadolu University"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <a
                  href="https://dergipark.org.tr/tr/pub/@onur_kemal_yilmaz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  DergiPark {isTr ? "Profili" : "Profile"}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Expertise Areas */}
          <h3 className="text-xl font-bold text-center mb-6">
            {isTr
              ? "Araştırma ve Uzmanlık Alanları"
              : "Research & Expertise Areas"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {expertise.map((area, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-1" style={{ backgroundColor: area.color }} />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: area.color + "15" }}
                    >
                      <area.icon
                        className="h-5 w-5"
                        style={{ color: area.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        {area.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {area.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notable Publications */}
          <h3 className="text-xl font-bold text-center mt-12 mb-6">
            {isTr ? "Öne Çıkan Yayınlar" : "Notable Publications"}
          </h3>
          <div className="space-y-3">
            {publications.map((pub, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-start gap-3">
                  <BookOpen
                    className={`h-4 w-4 ${pub.color} mt-0.5 shrink-0`}
                  />
                  <div>
                    <p className="text-sm font-medium">{pub.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pub.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Developer Credit + Footer */}
        <section className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-10">
          <div className="container max-w-4xl mx-auto px-4">
            {/* Developer Card */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-teal-400"></div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-teal-600 font-semibold">
                  {isTr ? "Geliştirici Ekip" : "Development Team"}
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-teal-400"></div>
              </div>
              <h3 className="text-lg font-bold tracking-tight mb-1">
                Erkan Erdem & Yiğit Avcı
              </h3>
              <p className="text-xs text-muted-foreground">
                {isTr
                  ? "Full-Stack Uygulama Geliştirici"
                  : "Full-Stack Application Developer"}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Academic Vision + KVKK + Copyright */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                {isTr
                  ? "Bu proje, Doç. Dr. Onur Kemal Yılmaz'ın akademik vizyonuyla geliştirilmektedir."
                  : "This project is developed under the academic vision of Assoc. Prof. Onur Kemal Yılmaz."}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                🔒{" "}
                {isTr
                  ? "KVKK kapsamında kişisel veri toplanmaz. Konum bilgisi yalnızca cihaz üzerinde işlenir."
                  : "No personal data is collected under KVKK. Location data is processed only on-device."}
              </p>
              <p className="text-xs text-muted-foreground/60 pt-2">
                © 2026 {isTr ? "Dijital Kaşif" : "Digital Explorer"} —{" "}
                {isTr ? "Tüm hakları saklıdır" : "All rights reserved"}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
