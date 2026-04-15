"use client";

import { cn } from '@/lib/utils';
import { Users, Bell, Heart, Smartphone, Lock } from 'lucide-react';

interface Feature {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    price: number;
}

const FEATURES: Feature[] = [
    {
        id: 'reminders',
        label: 'رسائل التذكير',
        description: 'إرسال تذكيرات تلقائية قبل المناسبة',
        icon: Bell,
        price: 50,
    },
    {
        id: 'thank_you',
        label: 'رسائل الشكر',
        description: 'إرسال رسالة شكر بعد المناسبة',
        icon: Heart,
        price: 50,
    },
    {
        id: 'apple_wallet',
        label: 'Apple Wallet',
        description: 'إضافة الدعوة لمحفظة Apple',
        icon: Smartphone,
        price: 30,
    },
    {
        id: 'guest_management',
        label: 'إدارة الضيوف',
        description: 'متابعة الحضور والردود',
        icon: Users,
        price: 0,
    },
];

interface FeatureSwitcherProps {
    features: Record<string, boolean>;
    onChange: (features: Record<string, boolean>) => void;
    disabled?: boolean;
    locked?: boolean;
}

export default function FeatureSwitcher({ features, onChange, disabled, locked }: FeatureSwitcherProps) {
    const toggleFeature = (id: string) => {
        if (disabled || locked) return;
        onChange({ ...features, [id]: !features[id] });
    };

    const totalExtraPrice = FEATURES.reduce((acc, f) => {
        return acc + (features[f.id] ? f.price : 0);
    }, 0);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    إضافات اختيارية
                </h3>
                {locked && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                        مقفل
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {FEATURES.map((feature) => (
                    <div
                        key={feature.id}
                        onClick={() => toggleFeature(feature.id)}
                        className={cn(
                            "p-4 rounded-2xl border-2 transition-all cursor-pointer",
                            features[feature.id]
                                ? "border-[#6A0DAD] bg-[#6A0DAD]/5"
                                : "border-zinc-100 hover:border-zinc-200",
                            (disabled || locked) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center",
                                    features[feature.id] ? "bg-[#6A0DAD] text-white" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{feature.label}</h4>
                                    <p className="text-xs text-zinc-500">{feature.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {feature.price > 0 && (
                                    <span className={cn(
                                        "font-bold text-sm",
                                        features[feature.id] ? "text-[#6A0DAD]" : "text-zinc-400"
                                    )}>
                                        +{feature.price} ر.س
                                    </span>
                                )}
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    features[feature.id]
                                        ? "border-[#6A0DAD] bg-[#6A0DAD]"
                                        : "border-zinc-300"
                                )}>
                                    {features[feature.id] && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalExtraPrice > 0 && (
                <div className="pt-4 border-t border-zinc-100">
                    <div className="flex justify-between items-center">
                        <span className="text-zinc-500 text-sm">تكلفة الإضافات</span>
                        <span className="text-lg font-black text-[#6A0DAD]">+{totalExtraPrice} ر.س</span>
                    </div>
                </div>
            )}
        </div>
    );
}
