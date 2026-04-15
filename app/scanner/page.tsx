"use client";

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Loader2, Camera, UserCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            if (!isProcessing) {
                handleAttendance(decodedText);
            }
        }

        function onScanFailure(error: any) {
            // Quietly handle scan failures (common during scanning)
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, []);

    const handleAttendance = async (guestId: string) => {
        setIsProcessing(true);
        setError(null);
        try {
            // 1. Validate Guest
            const { data: guest, error: fetchError } = await supabase
                .from('guests')
                .select('*, events(title)')
                .eq('id', guestId)
                .single();

            if (fetchError || !guest) throw new Error('لم يتم العثور على هذا الضيف');

            if (guest.attended) {
                setScanResult({ ...guest, status: 'already_attended' });
                return;
            }

            // 2. Update Attendance
            const { error: updateError } = await supabase
                .from('guests')
                .update({
                    attended: true,
                    arrival_time: new Date().toISOString()
                })
                .eq('id', guestId);

            if (updateError) throw updateError;

            setScanResult({ ...guest, status: 'success' });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <main className="max-w-4xl mx-auto px-6 pt-24 pb-24 space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-primary font-headline">ماسح الدخول الذكي</h2>
                    <p className="text-zinc-500 font-body">وجه الكاميرا نحو باركود دعوة الضيف</p>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-zinc-100 overflow-hidden">
                    <div id="reader" className="rounded-3xl overflow-hidden border-none"></div>
                </div>

                {/* Results Overlay */}
                {(scanResult || error || isProcessing) && (
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-zinc-100 animate-scale-in text-center space-y-6">
                        {isProcessing ? (
                            <div className="flex flex-col items-center gap-4 py-8">
                                <Loader2 className="w-12 h-12 text-[#6A0DAD] animate-spin" />
                                <p className="font-bold text-zinc-500">جاري التحقق من البيانات...</p>
                            </div>
                        ) : error ? (
                            <div className="space-y-4">
                                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                                <h3 className="text-xl font-bold text-red-600">فشل التحقق</h3>
                                <p className="text-zinc-500">{error}</p>
                                <button onClick={() => { setError(null); setScanResult(null); }} className="px-8 py-2 bg-zinc-100 rounded-xl font-bold">إغلاق</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                    {scanResult.status === 'success' ? (
                                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                                    ) : (
                                        <UserCheck className="w-12 h-12 text-amber-500" />
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <h3 className={cn(
                                        "text-2xl font-black",
                                        scanResult.status === 'success' ? "text-emerald-600" : "text-amber-600"
                                    )}>
                                        {scanResult.status === 'success' ? 'تم تأكيد الدخول' : 'تم الدخول مسبقاً'}
                                    </h3>
                                    <p className="text-xl font-bold text-primary">{scanResult.name}</p>
                                    <p className="text-zinc-400 text-sm">{scanResult.events?.title}</p>
                                </div>

                                <div className="pt-6 border-t border-zinc-50">
                                    <button
                                        onClick={() => setScanResult(null)}
                                        className="w-full py-3 bg-[#6A0DAD] text-white rounded-xl font-bold"
                                    >
                                        مسح ضيف آخر
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
