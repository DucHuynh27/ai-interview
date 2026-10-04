import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface StrengthsWeaknessesCardProps {
    strengths: string[];
    weaknesses: string[];
}

export function StrengthsWeaknessesCard({
    strengths,
    weaknesses,
}: StrengthsWeaknessesCardProps) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Strengths Card */}
            <Card className="border-emerald-500/20 bg-emerald-950/10 shadow-sm backdrop-blur-xl">
                <CardHeader className="pb-3 border-b border-emerald-500/10">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                            <CheckCircle2 className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-emerald-400">
                                Điểm mạnh nổi bật (Key Strengths)
                            </CardTitle>
                            <p className="text-xs text-zinc-400">
                                Những khía cạnh bạn đã thể hiện rất thuyết phục
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <ul className="space-y-3">
                        {strengths.map((item, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3 text-xs leading-relaxed text-zinc-200"
                            >
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-mono text-[10px] font-bold text-emerald-300">
                                    {index + 1}
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Weaknesses / Gaps Card */}
            <Card className="border-amber-500/20 bg-amber-950/10 shadow-sm backdrop-blur-xl">
                <CardHeader className="pb-3 border-b border-amber-500/10">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                            <AlertTriangle className="size-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold text-amber-400">
                                Điểm cần cải thiện (Areas for Improvement)
                            </CardTitle>
                            <p className="text-xs text-zinc-400">
                                Những điểm khuyết thiếu số liệu hoặc thiếu cấu trúc rõ ràng
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <ul className="space-y-3">
                        {weaknesses.map((item, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-xs leading-relaxed text-zinc-200"
                            >
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-mono text-[10px] font-bold text-amber-300">
                                    {index + 1}
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
