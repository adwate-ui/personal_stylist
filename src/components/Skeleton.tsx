export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
    );
}

export function CardSkeleton() {
    return (
        <div className="card h-full">
            <div className="aspect-[3/4] bg-white/5 w-full animate-pulse" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function ShopAnalysisSkeleton() {
    return (
        <div className="space-y-6">
            <div className="p-8 rounded-2xl glass border border-white/10 flex flex-col items-center gap-4">
                <Skeleton className="h-20 w-32 rounded-xl" />
                <Skeleton className="h-4 w-24" />
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </div>
    );
}

export function AddItemSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="space-y-6">
                <div className="aspect-[3/4] bg-white/5 rounded-2xl animate-pulse" />
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
            <div className="flex flex-col h-full space-y-6">
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <div className="mt-auto flex gap-4 pt-8">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 flex-[2]" />
                </div>
            </div>
        </div>
    );
}
