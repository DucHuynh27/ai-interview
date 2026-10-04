import { InterviewRoom } from "@/components/interview/InterviewRoom";

interface InterviewPageProps {
    params: Promise<{ id: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
    const { id: sessionId } = await params;

    return <InterviewRoom sessionId={sessionId} />;
}
