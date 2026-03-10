"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Card, CardBody, Button } from "@/components/ui";
import { useTheme } from "next-themes";

export const SettingsForm = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = [
    {
      title: "Profile Information",
      icon: User,
      desc: "Manage your personal details and academic profile.",
    },
    {
      title: "Notifications",
      icon: Bell,
      desc: "Configure how and when you want to be alerted.",
    },
    {
      title: "Security",
      icon: Shield,
      desc: "Update your password and manage security settings.",
    },
    {
      title: "Billing",
      icon: CreditCard,
      desc: "Manage your subscription and payment methods.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-black text-foreground flex items-center justify-center md:justify-start gap-3 mb-2">
          <Settings className="h-10 w-10 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Manage your account preferences and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appearance block (Theme Selector) */}
        <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30">
          <CardBody className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-primary/10 rounded-3xl">
                {mounted && resolvedTheme === "dark" ? (
                  <Moon className="h-8 w-8 text-primary" />
                ) : resolvedTheme === "light" ? (
                  <Sun className="h-8 w-8 text-primary" />
                ) : (
                  <Monitor className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-foreground mb-2">
                  Appearance
                </h3>
                <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                  Choose your preferred theme for the best viewing experience.
                </p>
                {mounted && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Light", value: "light", icon: Sun },
                        { label: "Dark", value: "dark", icon: Moon },
                        { label: "System", value: "system", icon: Monitor },
                      ].map(({ label, value, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                            theme === value
                              ? "border-primary bg-primary/10 text-primary shadow-lg"
                              : "border-border hover:border-primary/50 bg-card text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-sm font-bold">{label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <span>Currently using:</span>
                      <span className="font-bold capitalize px-2 py-1 bg-muted rounded-full text-foreground">
                        {resolvedTheme} mode
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {sections.map((section, index) => (
          <Card
            key={section.title}
            className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/30"
          >
            <CardBody className="p-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-primary/10 rounded-3xl">
                  <section.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-foreground mb-2">
                    {section.title}
                  </h3>
                  <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                    {section.desc}
                  </p>
                  <Button
                    variant="outline"
                    className="h-12 px-6 font-bold border-2 hover:border-primary hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
