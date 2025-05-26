import { cn } from "@/lib/utils";
import {
  Bot,
  MessageCircle,
  Users,
  Sparkles,
  ShieldCheck,
  Globe2,
  Zap,
  Smile,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "AI-Powered",
      description:
        "Mention @oxa in any post to get smart, contextual AI replies—powered by cutting-edge models.",
      icon: <Bot />,
    },
    {
      title: "Realtime Messaging",
      description:
        "One-on-one DMs that feel instant. No delays. No refresh. Just seamless conversations.",
      icon: <MessageCircle />,
    },
    {
      title: "Community First",
      description:
        "Follow, react, share, and build your circle. Nesahub grows with you.",
      icon: <Users />,
    },
    {
      title: "Global Reach",
      description:
        "Whether you're in Surabaya or Silicon Valley, Nesahub connects you with the world seamlessly.",
      icon: <Globe2 />,
    },
    {
      title: "Always-on Infrastructure",
      description:
        "Built to scale with you. Uptime, speed, and reliability you can trust.",
      icon: <Zap />,
    },
    {
      title: "Positive Vibes Only",
      description:
        "We promote good energy and thoughtful conversations. Toxicity gets filtered.",
      icon: <Smile />,
    },
    {
      title: "Privacy Built-in",
      description:
        "Private by design. Your messages and data stay yours—no shady tracking.",
      icon: <ShieldCheck />,
    },
    {
      title: "Fast & Minimal",
      description:
        "No bloat, no noise. Just a clean interface that stays out of your way.",
      icon: <Sparkles />,
    },
  ];
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-xl md:text-2xl lg:text-4xl font-semibold text-neutral-800 dark:text-neutral-100 ">
          Powering the Future of Social
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
