import { FASHION_GLOSSARY, getGlossarySegments } from "@/lib/fashionGlossary";

export function GlossaryText({ text, className = "" }: { text: string, className?: string }) {
    if (!text) return null;

    const segments = getGlossarySegments(text);

    return (
        <span className={className}>
            {segments.map((segment, i) => {
                const lower = segment.toLowerCase();
                const definition = FASHION_GLOSSARY[lower];

                if (definition) {
                    return (
                        <span key={i} className="group relative inline-block cursor-help border-b border-dotted border-primary/50 hover:border-primary transition-colors">
                            <span className="text-primary/90 font-medium">{segment}</span>

                            {/* Tooltip */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-xs text-start opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 transform group-hover:-translate-y-1">
                                <span className="block font-bold text-primary mb-1 capitalize border-b border-white/10 pb-1">{lower}</span>
                                <span className="text-gray-300 leading-relaxed block">{definition}</span>
                                {/* Arrow */}
                                <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></span>
                            </span>
                        </span>
                    );
                }
                return <span key={i}>{segment}</span>;
            })}
        </span>
    );
}
