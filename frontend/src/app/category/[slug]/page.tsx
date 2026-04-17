import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";

const CATEGORIES = ["Tech","Startup","Cultural","Business","Sports","Education","Entertainment","Hackathon","Meetup","Conference"];

const categoryEmojis: Record<string, string> = {
  tech: "💻", startup: "🚀", cultural: "🎭", business: "💼",
  sports: "⚽", education: "📚", entertainment: "🎵",
  hackathon: "⚡", meetup: "🤝", conference: "🎤",
};

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.toLowerCase() === slug);
  if (!cat) return { title: "Category Not Found" };
  return {
    title: `${cat} Events in Delhi & Noida 2025`,
    description: `Find the best ${cat.toLowerCase()} events in Delhi and Noida. Browse upcoming ${cat.toLowerCase()} conferences, meetups, workshops and more. Updated daily.`,
    keywords: [`${cat.toLowerCase()} events delhi`, `${cat.toLowerCase()} events noida`, `${cat.toLowerCase()} events NCR`],
    openGraph: {
      title: `${cat} Events in Delhi-NCR 2025`,
      description: `Discover top ${cat.toLowerCase()} events in Delhi and Noida`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.toLowerCase() === slug);
  if (!cat) notFound();
  return <CategoryClient category={cat} emoji={categoryEmojis[slug] || "📅"} />;
}
