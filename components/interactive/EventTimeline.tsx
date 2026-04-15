"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TimelineItem {
    id: string;
    title: string;
    time: string;
    description: string;
}

interface EventTimelineProps {
    items: TimelineItem[];
}

export default function EventTimeline({ items }: EventTimelineProps) {
    return (
        <div className="relative py-12 px-6">
            {/* Central Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-200 -translate-x-1/2" />

            <div className="space-y-24 relative">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`flex items-center gap-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                        {/* Content Card */}
                        <div className={`flex-1 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 space-y-2 hover:shadow-md transition-shadow">
                                <div className={`flex items-center gap-2 mb-2 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                    <Clock className="w-4 h-4 text-[#6A0DAD]" />
                                    <span className="text-sm font-bold text-[#6A0DAD]">{item.time}</span>
                                </div>
                                <h4 className="text-xl font-black text-primary font-headline">{item.title}</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed font-body">{item.description}</p>
                            </div>
                        </div>

                        {/* Indicator Dot */}
                        <div className="z-10 w-4 h-4 rounded-full bg-[#6A0DAD] border-4 border-white shadow-sm" />

                        {/* Spacer */}
                        <div className="flex-1 hidden md:block" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
