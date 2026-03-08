'use client';

import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react';
import { Card, CardBody, Button } from '@/components/ui';

export const SettingsForm = () => {
  const sections = [
    { title: 'Profile Information', icon: User, desc: 'Manage your personal details and academic profile.' },
    { title: 'Notifications', icon: Bell, desc: 'Configure how and when you want to be alerted.' },
    { title: 'Security', icon: Shield, desc: 'Update your password and manage security settings.' },
    { title: 'Billing', icon: CreditCard, desc: 'Manage your subscription and payment methods.' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1 font-medium">Manage your account preferences and system settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Card key={section.title} className="hover:border-primary/20 transition-colors">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-600 font-medium mb-4">{section.desc}</p>
                  <Button variant="ghost" className="p-0 h-auto font-bold text-primary hover:bg-transparent">
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
