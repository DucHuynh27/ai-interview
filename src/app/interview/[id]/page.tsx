import { InterviewRoom } from "@/components/interview/InterviewRoom";

// Server Action phản hồi theo từng lượt (Gemini) có thể chạy lâu.
export const maxDuration = 60;

interface InterviewPageProps {
    params: Promise<{ id: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
    const { id: sessionId } = await params;

    return <InterviewRoom sessionId={sessionId} />;
}
