export default function EventCardSkeleton() {
  return (
    <div className="h-[420px] rounded-xl overflow-hidden bg-surface-container animate-pulse border border-white/5 relative">
      <div className="absolute inset-0 bg-white/5" />
      <div className="absolute bottom-0 p-6 w-full gap-3 flex flex-col z-10">
        <div className="w-20 h-6 bg-white/10 rounded-sm" />
        <div className="w-3/4 h-8 bg-white/10 rounded-md" />
        <div className="w-1/2 h-8 bg-white/10 rounded-md" />
        <div className="flex justify-between mt-2">
          <div className="w-1/3 h-5 bg-white/10 rounded-md" />
          <div className="w-1/4 h-5 bg-white/10 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function EventsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
      <div style={{ width: 200, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.07)", margin: "0 auto 16px", animation: "pulse 1.8s infinite" }} />
      <div style={{ width: 400, height: 20, borderRadius: 8, background: "rgba(255,255,255,0.05)", margin: "0 auto", animation: "pulse 1.8s infinite" }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ textAlign: "center", animation: "pulse 1.8s infinite" }}>
          <div style={{ width: 80, height: 36, borderRadius: 8, background: "rgba(99,102,241,0.15)", marginBottom: 8 }} />
          <div style={{ width: 100, height: 16, borderRadius: 6, background: "rgba(255,255,255,0.07)" }} />
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
