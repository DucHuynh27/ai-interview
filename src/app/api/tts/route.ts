import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get("text")?.trim();
    const lang = searchParams.get("lang")?.trim() || "vi";

    if (!text) {
        return new NextResponse("Text parameter is required", { status: 400 });
    }

    try {
        // Split text into chunks that comply with Google TTS limits (~180 chars)
        const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
        const chunks: string[] = [];
        let current = "";

        for (const s of sentences) {
            if ((current + " " + s).trim().length <= 180) {
                current = (current + " " + s).trim();
            } else {
                if (current) chunks.push(current);
                if (s.length > 180) {
                    const words = s.split(" ");
                    let sub = "";
                    for (const w of words) {
                        if ((sub + " " + w).trim().length <= 180) {
                            sub = (sub + " " + w).trim();
                        } else {
                            if (sub) chunks.push(sub);
                            sub = w;
                        }
                    }
                    current = sub;
                } else {
                    current = s.trim();
                }
            }
        }
        if (current) chunks.push(current);

        const audioBuffers: ArrayBuffer[] = [];

        for (const chunk of chunks) {
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
            const res = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            });

            if (!res.ok) {
                throw new Error(`TTS provider returned HTTP ${res.status}`);
            }

            const buf = await res.arrayBuffer();
            audioBuffers.push(buf);
        }

        const totalLength = audioBuffers.reduce(
            (acc, b) => acc + b.byteLength,
            0,
        );
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const b of audioBuffers) {
            combined.set(new Uint8Array(b), offset);
            offset += b.byteLength;
        }

        return new Response(combined, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
            },
        });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "TTS Generation Failed";
        return new NextResponse(message, { status: 500 });
    }
}
