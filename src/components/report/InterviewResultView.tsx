"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { evaluateInterviewSession } from "@/app/actions/report";
import { PREVIEW_SESSION_KEY } from "@/components/interview/SetupForm";
import { ScoreOverviewCard } from "@/components/report/ScoreOverviewCard";
import { StrengthsWeaknessesCard } from "@/components/report/StrengthsWeaknessesCard";
import { SampleBetterAnswerCard } from "@/components/report/SampleBetterAnswerCard";
import { QuestionFeedbackCard } from "@/components/report/QuestionFeedbackCard";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
    InterviewSessionData,
    PersonaType,
    SessionTranscript,
} from "@/types/interview";
import { TRANSCRIPT_STORAGE_PREFIX } from "@/types/interview";
import type {
    EvaluateSessionPayload,
    InterviewEvaluationReport,
} from "@/types/report";
import { REPORT_STORAGE_PREFIX } from "@/types/report";
import {
    AlertCircle,
    CheckCircle2,
    Coins,
    FileText,
    ListFilter,
    RotateCcw,
    Sparkles,
    TrendingUp,
} from "lucide-react";

interface InterviewResultViewProps {
    sessionId: string;
}

// ─── Realistic Fallback Mock Data khi mở trực tiếp / kết nối demo ────────────
const DEMO_EVALUATION_REPORT: InterviewEvaluationReport = {
    sessionId: "demo-session",
    overallScore: 82,
    situationScore: 8,
    taskScore: 8,
    actionScore: 9,
    resultScore: 7,
    summary:
        "Ứng viên thể hiện thái độ tự tin, khả năng giải quyết vấn đề kỹ thuật rõ ràng và tư duy làm việc nhóm tích cực. Điểm mạnh lớn nhất là mô tả chi tiết các hành động cụ thể (Action) trong dự án thực tế. Để nâng tầm câu trả lời lên mức xuất sắc (90+), ứng viên cần bổ sung thêm các số liệu định lượng (Result) cụ thể hơn về hiệu năng và tác động kinh doanh.",
    strengths: [
        "Mô tả hành động cá nhân (Action) rất chủ động và chi tiết, không bị phụ thuộc vào câu chữ chung chung.",
        "Khả năng phân tích nguyên nhân gốc rễ (Root Cause) của sự cố kỹ thuật tốt.",
        "Tinh thần hợp tác và lắng nghe ý kiến phản biện của đồng đội trong tình huống xung đột.",
    ],
    weaknesses: [
        "Thiếu các chỉ số định lượng cụ thể (Metrics / KPIs) khi tổng kết kết quả dự án (Result).",
        "Phần giới thiệu bản thân còn hơi dài dòng, chưa làm nổi bật ngay điểm khác biệt lớn nhất so với JD.",
        "Cần nhấn mạnh bài học rút ra (Lessons Learned) sau khi khắc phục thất bại.",
    ],
    questionFeedbacks: [
        {
            questionIndex: 1,
            questionText:
                "Chào bạn, rất vui được gặp bạn trong buổi phỏng vấn hôm nay. Bạn hãy giới thiệu đôi nét về bản thân và chia sẻ lý do bạn ứng tuyển vị trí này?",
            category: "WARM_UP",
            candidateAnswer:
                "Em chào anh chị, em tốt nghiệp ngành CNTT và đã có hơn 1 năm làm việc với React và Next.js. Em thấy công ty mình đang mở rộng mảng Web Platform và văn hóa mở nên em rất muốn được thử sức và đóng góp năng lực lập trình của mình.",
            situationScore: 8,
            taskScore: 8,
            actionScore: 7,
            resultScore: 7,
            score: 78,
            strengths: [
                "Thái độ lịch sự, nêu đúng công nghệ trọng tâm (React, Next.js).",
                "Có tìm hiểu sơ bộ về định hướng sản phẩm của công ty.",
            ],
            weaknesses: [
                "Chưa nêu bật được thành tựu cá nhân nổi bật nhất trong năm vừa qua.",
            ],
            suggestedAnswer:
                "Chào anh/chị, em là một Frontend Engineer với 1+ năm kinh nghiệm thực chiến phát triển ứng dụng Next.js và tối ưu hóa hiệu năng web. Tại dự án gần nhất, em từng cải thiện chỉ số LCP giảm 35% cho trang thương mại điện tử. Biết công ty đang mở rộng hệ sinh thái web platform hiện đại, em tin nền tảng kỹ thuật và tinh thần chủ động giải quyết vấn đề của em sẽ đóng góp thiết thực cho đội ngũ ngay từ những tuần đầu tiên.",
        },
        {
            questionIndex: 2,
            questionText:
                "Hãy chia sẻ về một lần bạn gặp bất đồng ý kiến hoặc mâu thuẫn chuyên môn với đồng nghiệp trong nhóm. Bạn đã giải quyết tình huống đó như thế nào?",
            category: "BEHAVIORAL_STAR",
            candidateAnswer:
                "Trong một sprint, bạn Backend muốn dùng REST API truyền thống còn em đề xuất dùng Server Actions và RPC để giảm boilerplate. Em đã hẹn bạn trao đổi riêng, làm một POC nhỏ so sánh bundle size và tốc độ tải trang để cả hai cùng nhìn vào số liệu khách quan.",
            situationScore: 9,
            taskScore: 8,
            actionScore: 9,
            resultScore: 8,
            score: 86,
            strengths: [
                "Cấu trúc STAR rất mạch lạc: Nêu rõ mâu thuẫn kỹ thuật và cách giải quyết bằng dữ liệu (POC) thay vì cảm tính.",
                "Thái độ trao đổi tôn trọng, tránh xung đột cá nhân trên nhóm chung.",
            ],
            weaknesses: [
                "Có thể bổ sung thêm việc sau đó quy chuẩn này được cả team áp dụng như thế nào.",
            ],
            suggestedAnswer:
                "Trong dự án trước, khi thảo luận về kiến trúc giao tiếp giữa Frontend và Backend, bạn đồng nghiệp ưu tiên REST API vì quen thuộc, trong khi em nhận thấy Server Actions sẽ tối ưu hoá Type Safety và loại bỏ hơn 30% boilerplate code. Thay vì tranh cãi lý thuyết, em đã chủ động hẹn bạn 1 buổi 30 phút và dựng một bản Demo nhỏ đo lường trực tiếp tốc độ build và kích thước payload. Khi nhìn thấy số liệu khách quan chứng minh trải nghiệm người dùng tăng 20%, bạn đã hoàn toàn đồng thuận và chúng em thống nhất đưa chuẩn này vào guideline của cả nhóm.",
        },
        {
            questionIndex: 3,
            questionText:
                "Bạn đã từng phải đối mặt với một deadline rất gấp hoặc một sự cố bất ngờ trong dự án chưa? Bạn đã sắp xếp ưu tiên và hành động ra sao?",
            category: "BEHAVIORAL_STAR",
            candidateAnswer:
                "Trước ngày release tính năng thanh toán, hệ thống bất ngờ phát sinh lỗi rò rỉ bộ nhớ khiến server bị crash liên tục. Em đã ngồi lại phân tích log, khoanh vùng commit gần nhất và quyết định rollback phần tính năng phụ để giữ cho luồng chính hoạt động ổn định.",
            situationScore: 8,
            taskScore: 8,
            actionScore: 9,
            resultScore: 8,
            score: 84,
            strengths: [
                "Bình tĩnh xử lý sự cố có tính rủi ro cao.",
                "Biết ưu tiên tính ổn định của hệ thống trước khi theo đuổi tính năng mới.",
            ],
            weaknesses: [
                "Cần nói rõ nguyên nhân gốc rễ của memory leak sau khi điều tra sâu hơn.",
            ],
            suggestedAnswer:
                "Chỉ 4 giờ trước đợt phát hành lớn, môi trường staging phát sinh lỗi rò rỉ bộ nhớ khiến ứng dụng bị crash khi tải trọng tăng cao. Với vai trò phụ trách module chính, em lập tức kích hoạt quy trình ứng phó: tạm thời cô lập các thay đổi phụ, rollback commit nghi vấn để đảm bảo tiến độ release dịch vụ cốt lõi đúng giờ. Sau đó, em sử dụng Chrome DevTools Heap Snapshot để tìm ra một event listener chưa được dọn dẹp và xử lý dứt điểm trước khi mở toàn bộ tính năng vào sáng hôm sau.",
        },
        {
            questionIndex: 4,
            questionText:
                "Trong các dự án gần đây được nêu trong CV, bài toán kỹ thuật phức tạp nhất mà bạn trực tiếp thiết kế hoặc tối ưu là gì? Kết quả cụ thể đạt được ra sao?",
            category: "ROLE_SPECIFIC",
            candidateAnswer:
                "Bài toán khó nhất là tối ưu tốc độ tải trang sản phẩm có hàng nghìn hình ảnh. Em đã cấu hình Next.js Image với WebP, triển khai virtual scrolling và lazy loading.",
            situationScore: 7,
            taskScore: 7,
            actionScore: 8,
            resultScore: 7,
            score: 76,
            strengths: [
                "Áp dụng đúng các kỹ thuật hiện đại của Next.js (Image Optimization, Virtualization).",
            ],
            weaknesses: [
                "Chưa nêu rõ chỉ số định lượng cụ thể: Tốc độ tải giảm từ bao nhiêu giây xuống bao nhiêu giây.",
            ],
            suggestedAnswer:
                "Tại dự án nền tảng thương mại điện tử, trang danh mục chứa hơn 5.000 sản phẩm khiến thời gian hiển thị ban đầu lên tới 4.2 giây và chỉ số CLS bị cảnh báo đỏ. Em đã trực tiếp tái cấu trúc luồng render: tích hợp `@tanstack/react-virtual` để chỉ render các phần tử nằm trong viewport, đồng thời áp dụng định dạng ảnh WebP/AVIF qua Next.js Image. Kết quả là kích thước DOM giảm 70%, chỉ số LCP giảm mạnh từ 4.2s xuống 1.1s, đưa điểm Google Lighthouse từ 54 lên 96/100.",
        },
        {
            questionIndex: 5,
            questionText:
                "Nếu được nhận vào vị trí này, trong 30 ngày đầu tiên bạn dự định sẽ làm những gì để hòa nhập nhanh nhất và tạo ra giá trị cho công ty?",
            category: "SITUATIONAL",
            candidateAnswer:
                "Em sẽ đọc kỹ tài liệu dự án, setup môi trường local và trao đổi với mentor để nắm rõ coding convention cũng như quy trình deploy của team.",
            situationScore: 8,
            taskScore: 8,
            actionScore: 8,
            resultScore: 8,
            score: 82,
            strengths: [
                "Tư duy hòa nhập bài bản, tôn trọng quy trình sẵn có của doanh nghiệp.",
            ],
            weaknesses: [
                "Nên chia lộ trình theo từng mốc 10 - 20 - 30 ngày cụ thể.",
            ],
            suggestedAnswer:
                "Trong 30 ngày đầu, em đặt ra 3 mục tiêu rõ ràng: 10 ngày đầu tiên làm chủ kiến trúc mã nguồn, quy trình CI/CD và giải quyết 2 bug nhỏ để làm quen luồng đóng góp; 10 ngày tiếp theo chủ động trao đổi với Product Owner để hiểu tường tận nghiệp vụ người dùng; và ở 10 ngày cuối cùng, em sẽ độc lập phụ trách hoàn chỉnh một tính năng đầu tiên trong sprint với 100% test coverage.",
        },
    ],
    sampleBetterAnswer: {
        questionIndex: 4,
        questionText:
            "Trong các dự án gần đây được nêu trong CV, bài toán kỹ thuật phức tạp nhất mà bạn trực tiếp thiết kế hoặc tối ưu là gì? Kết quả cụ thể đạt được ra sao?",
        goldStandardAnswer:
            "Tại dự án nền tảng thương mại điện tử phục vụ hơn 50.000 người dùng hàng tháng, trang danh mục chứa hơn 5.000 sản phẩm khiến thời gian tải trang ban đầu lên tới 4.2 giây, gây tỷ lệ thoát trang cao (Situation).\n\nMục tiêu của em là giảm thời gian tải xuống dưới 1.5 giây và đạt chuẩn Core Web Vitals của Google (Task).\n\nEm đã trực tiếp tái cấu trúc tầng hiển thị: áp dụng Virtual Scrolling với `@tanstack/react-virtual` để giảm số lượng node trên DOM từ 8.000 xuống còn chưa đầy 80 node hiển thị tức thời; tối ưu hóa tài nguyên ảnh bằng Next.js Image Component kết hợp CDN caching (Action).\n\nKết quả mang lại rất cụ thể: Thời gian LCP giảm 74% (từ 4.2s xuống 1.1s), điểm Lighthouse từ 54 tăng lên 96 điểm, và tỷ lệ chuyển đổi giỏ hàng tăng thêm 14% trong tháng tiếp theo (Result).",
        keyTakeaway:
            "Công thức thành công: Luôn đi kèm số liệu trước - sau (4.2s -> 1.1s) để chứng minh năng lực kỹ thuật đã đem lại giá trị kinh doanh thực tế.",
    },
    evaluatedAt: new Date().toISOString(),
};

export function InterviewResultView({ sessionId }: InterviewResultViewProps) {
    const [report, setReport] = useState<InterviewEvaluationReport | null>(null);
    const [persona, setPersona] = useState<PersonaType>("friendly_hr");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDemoFallback, setIsDemoFallback] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const loadOrEvaluateReport = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            // 1. Kiểm tra cache báo cáo đã lưu trước đó
            const cachedReportRaw = sessionStorage.getItem(
                `${REPORT_STORAGE_PREFIX}${sessionId}`,
            );

            if (cachedReportRaw) {
                try {
                    const parsedReport = JSON.parse(
                        cachedReportRaw,
                    ) as InterviewEvaluationReport;
                    setReport(parsedReport);

                    // Lấy persona nếu có
                    const previewRaw = sessionStorage.getItem(
                        `${PREVIEW_SESSION_KEY}:${sessionId}`,
                    );
                    if (previewRaw) {
                        try {
                            const sessionData = JSON.parse(
                                previewRaw,
                            ) as InterviewSessionData;
                            setPersona(sessionData.persona);
                        } catch {
                            // ignore
                        }
                    }

                    setIsLoading(false);
                    return;
                } catch {
                    // Fallthrough to fetch/generate
                }
            }

            // 2. Lấy dữ liệu transcript từ phiên phỏng vấn
            const transcriptRaw = sessionStorage.getItem(
                `${TRANSCRIPT_STORAGE_PREFIX}${sessionId}`,
            );
            const previewRaw = sessionStorage.getItem(
                `${PREVIEW_SESSION_KEY}:${sessionId}`,
            );

            let sessionTranscript: SessionTranscript | null = null;
            let sessionData: InterviewSessionData | null = null;

            if (transcriptRaw) {
                try {
                    sessionTranscript = JSON.parse(
                        transcriptRaw,
                    ) as SessionTranscript;
                } catch {
                    // ignore
                }
            }

            if (previewRaw) {
                try {
                    sessionData = JSON.parse(previewRaw) as InterviewSessionData;
                    if (sessionData.persona) {
                        setPersona(sessionData.persona);
                    }
                } catch {
                    // ignore
                }
            }

            // 3. Nếu không có transcript thực tế (truy cập URL trực tiếp / demo mode)
            if (
                !sessionTranscript ||
                !sessionTranscript.turns ||
                sessionTranscript.turns.length === 0
            ) {
                setIsDemoFallback(true);
                setReport({ ...DEMO_EVALUATION_REPORT, sessionId });
                setIsLoading(false);
                return;
            }

            // 4. Có dữ liệu transcript: Gửi sang server action để chấm điểm STAR
            startTransition(async () => {
                try {
                    const payload: EvaluateSessionPayload = {
                        sessionId,
                        persona: sessionTranscript.persona ?? "friendly_hr",
                        language: sessionTranscript.language ?? "vi",
                        turns: sessionTranscript.turns,
                        extractedSkills:
                            sessionData?.data?.summary?.extractedSkills,
                        identifiedGaps:
                            sessionData?.data?.summary?.identifiedGaps,
                    };

                    const result = await evaluateInterviewSession(payload);

                    if (result.ok) {
                        setReport(result.data);
                        sessionStorage.setItem(
                            `${REPORT_STORAGE_PREFIX}${sessionId}`,
                            JSON.stringify(result.data),
                        );
                    } else {
                        // Fallback sang demo nếu API gặp giới hạn key hoặc lỗi
                        setErrorMessage(
                            `Không thể kết nối API AI: ${result.error}. Đang hiển thị dữ liệu phân tích mẫu.`,
                        );
                        setIsDemoFallback(true);
                        setReport({ ...DEMO_EVALUATION_REPORT, sessionId });
                    }
                } catch {
                    setErrorMessage(
                        "Đã xảy ra sự cố khi xử lý báo cáo. Đang hiển thị bản phân tích dự phòng.",
                    );
                    setIsDemoFallback(true);
                    setReport({ ...DEMO_EVALUATION_REPORT, sessionId });
                } finally {
                    setIsLoading(false);
                }
            });
        };

        loadOrEvaluateReport();
    }, [sessionId]);

    if (isLoading || isPending) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="relative flex size-16 items-center justify-center">
                    <div className="absolute inset-0 size-full animate-ping rounded-full bg-emerald-500/20" />
                    <div className="size-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
                </div>
                <div className="space-y-1">
                    <h2 className="text-base font-bold text-zinc-100">
                        Đang phân tích cấu trúc STAR & lập báo cáo...
                    </h2>
                    <p className="max-w-md text-xs text-zinc-400">
                        Gemini 2.0 Flash đang đối soát toàn bộ transcript phỏng vấn,
                        chấm điểm 4 tiêu chí và xây dựng câu trả lời mẫu điểm 10.
                    </p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
                <AlertCircle className="size-12 text-rose-400" />
                <h2 className="text-lg font-bold text-zinc-100">
                    Không tìm thấy báo cáo phỏng vấn
                </h2>
                <p className="text-xs text-zinc-400">
                    Phiên phỏng vấn này chưa có dữ liệu hoặc đã bị xóa khỏi phiên làm việc.
                </p>
                <Link
                    href="/interview/setup"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                    <RotateCcw className="mr-2 size-4" />
                    Bắt đầu phỏng vấn mới
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Top Notification if Error or Demo Fallback */}
            {errorMessage && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0 text-rose-400" />
                        <span>{errorMessage}</span>
                    </div>
                </div>
            )}
            {isDemoFallback && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-4 shrink-0 text-amber-400" />
                        <span>
                            <strong>Chế độ Xem Trước (Demo Report):</strong> Bạn đang
                            xem báo cáo phân tích mẫu chuẩn STAR dựa trên hồ sơ Frontend
                            Developer.
                        </span>
                    </div>
                </div>
            )}

            {/* Header Title & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                            Báo Cáo Đánh Giá Phỏng Vấn
                        </h1>
                        <Badge
                            variant="outline"
                            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold"
                        >
                            STAR Certified
                        </Badge>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                        Mã phiên: <code className="font-mono text-zinc-300">{sessionId}</code> •
                        Hệ thống đối soát toàn diện bởi Google Gemini 2.0 Flash
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                        href={`/interview/${sessionId}`}
                        className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
                        })}
                    >
                        <FileText className="mr-1.5 size-4" />
                        Xem Transcript
                    </Link>

                    <Link
                        href="/interview/setup"
                        className={buttonVariants({
                            size: "sm",
                            className: "bg-emerald-600 font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950",
                        })}
                    >
                        <RotateCcw className="mr-1.5 size-4" />
                        Luyện tập phiên mới
                    </Link>
                </div>
            </div>

            {/* 1. Score Overview & STAR Radar Chart */}
            <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <TrendingUp className="size-4 text-emerald-400" />
                    Tổng quan hiệu suất phỏng vấn
                </div>
                <ScoreOverviewCard report={report} persona={persona} />
            </section>

            {/* 2. Key Strengths and Growth Areas */}
            <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    Phân tích điểm mạnh & Điểm cần bổ sung
                </div>
                <StrengthsWeaknessesCard
                    strengths={report.strengths}
                    weaknesses={report.weaknesses}
                />
            </section>

            {/* 3. Gold Standard Sample Answer (10/10) */}
            {report.sampleBetterAnswer && (
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <Sparkles className="size-4 text-amber-400" />
                        Hình mẫu câu trả lời điểm 10
                    </div>
                    <SampleBetterAnswerCard
                        sampleBetterAnswer={report.sampleBetterAnswer}
                    />
                </section>
            )}

            {/* 4. Question-by-Question Detailed Feedback */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                        <ListFilter className="size-4 text-emerald-400" />
                        Đánh giá chi tiết từng câu hỏi ({report.questionFeedbacks.length} câu)
                    </div>
                    <span className="text-[11px] text-zinc-400">
                        Nhấn vào từng câu để mở rộng phân tích & câu trả lời mẫu
                    </span>
                </div>

                <div className="space-y-3">
                    {report.questionFeedbacks.map((feedback, idx) => (
                        <QuestionFeedbackCard
                            key={feedback.questionIndex}
                            feedback={feedback}
                            defaultOpen={idx === 0}
                        />
                    ))}
                </div>
            </section>

            {/* 5. Unit Economics & Pitch Value Badge */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-zinc-400 backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Coins className="size-4" />
                        </div>
                        <div>
                            <span className="font-semibold text-zinc-200">
                                Chi phí AI tối ưu (Unit Economics):
                            </span>{" "}
                            Toàn bộ phiên phỏng vấn và báo cáo STAR 4 trụ cột tiêu tốn ~0.0008 USD (~20 - 50 VNĐ).
                        </div>
                    </div>
                    <span className="rounded-full bg-zinc-900 px-3 py-1 font-mono text-[11px] text-zinc-400 border border-zinc-800">
                        Gemini 2.0 Flash • 0đ STT/TTS
                    </span>
                </div>
            </div>
        </div>
    );
}
