import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function App() {
  const y = useMotionValue(0);

  const sections = [
    { id: 0, title: "Intro", text: "Apple. The man. A few quotes." },
    { id: 1, title: "Keynote", text: "Stage presence & storytelling." },
    { id: 2, title: "Design", text: "Simplicity & craft." },
    { id: 3, title: "Legacy", text: "The aftermath & memory." },
  ];

  const viewportH = window.innerHeight;
  const contentH = sections.length * viewportH;
  const maxScroll = contentH - viewportH;

  // scrollbar
  const trackHeight = 200;

  // scroll progress (0 → 1)
  const scrollProgress = useTransform(y, (val) => -val / maxScroll);
  const fillHeight = useTransform(scrollProgress, (p) => p * trackHeight);

  // wheel / touchpad
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      let next = y.get() - e.deltaY * 2;

      if (next > 0) next = 0;
      if (next < -maxScroll) next = -maxScroll;

      animate(y, next, { type: "spring", stiffness: 90, damping: 20 });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [maxScroll]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white relative">
      {/* content */}
      <motion.div style={{ y }}>
        {sections.map((s) => (
          <section
            key={s.id}
            className="h-screen flex flex-col items-center justify-center text-center"
            style={{ background: s.id % 2 === 0 ? "#0f172a" : "#1e293b" }}
          >
            <h2 className="text-5xl font-bold mb-6">{s.title}</h2>
            <p className="text-xl max-w-2xl">{s.text}</p>
          </section>
        ))}
      </motion.div>

      {/* custom scrollbar (progress style) */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2"
        style={{
          height: trackHeight,
          width: 6,
          background: "#334155",
          borderRadius: 3,
        }}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const progress = clickY / trackHeight;
          const next = -(progress * maxScroll);
          animate(y, next, { type: "spring", stiffness: 90, damping: 20 });
        }}
      >
        {/* fill bar */}
        <motion.div
          style={{
            height: fillHeight,
            width: 6,
            background: "#f8fafc",
            borderRadius: 3,
            originY: 0, // fix from top
          }}
        />

        {/* draggable thumb (at end of bar) */}
        <motion.div
          style={{
            y: fillHeight, // thumb follows bottom of bar
            x: 0.19, // align center
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#f8fafc",
            position: "absolute",
            top: 0,
            cursor: "grab",
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: trackHeight }}
          dragElastic={0}
          onDrag={(e, info) => {
            const rect = e.target.parentNode.getBoundingClientRect();
            const relativeY = info.point.y - rect.top;
            const progress = relativeY / trackHeight;
            const next = -(progress * maxScroll);

            if (next <= 0 && next >= -maxScroll) {
              y.set(next);
            }
          }}
        />
      </div>
    </div>
  );
}
