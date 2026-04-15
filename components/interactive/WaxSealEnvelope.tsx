"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

interface WaxSealEnvelopeProps {
    card_image_url: string;
    onOpened: () => void;
}

export default function WaxSealEnvelope({ card_image_url, onOpened }: WaxSealEnvelopeProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative w-[340px] h-[480px] perspective-[1000px] cursor-pointer" onClick={() => !isOpen && setIsOpen(true)}>
            <AnimatePresence>
                {!isOpen ? (
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="w-full h-full bg-[#fdfdfd] shadow-2xl rounded-sm border border-zinc-100 flex items-center justify-center relative overflow-hidden"
                    >
                        {/* Texture Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }} />

                        {/* Envelope Flap Top */}
                        <div className="absolute top-0 left-0 right-0 h-[240px] bg-[#f9f9f9] border-b border-zinc-100 origin-top z-10" />

                        {/* Wax Seal */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="z-20 w-24 h-24 relative"
                        >
                            <Image
                                src="https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA4L2pvYjEwNjctMDItdi5qcGc.jpg"
                                alt="Wax Seal"
                                fill
                                className="object-contain drop-shadow-lg"
                            />
                        </motion.div>

                        <p className="absolute bottom-8 text-[#6A0DAD] font-headline text-lg italic opacity-40">اضغط للفتح</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full h-full flex flex-col items-center justify-center gap-6"
                    >
                        {/* Animated Opening Flap */}
                        <div className="relative w-full aspect-[3/4.2] rounded-2xl overflow-hidden shadow-2xl bg-white border border-zinc-100">
                            <motion.div
                                initial={{ y: 200 }}
                                animate={{ y: 0 }}
                                transition={{ type: "spring", damping: 15 }}
                                className="w-full h-full"
                            >
                                <Image src={card_image_url} alt="Invitation" fill className="object-cover" />
                            </motion.div>
                        </div>

                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            onClick={onOpened}
                            className="px-8 py-3 bg-[#6A0DAD] text-white rounded-xl font-bold text-sm shadow-xl"
                        >
                            عرض التفاصيل والجدول الزمني
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
