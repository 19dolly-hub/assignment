import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function App() {
  // === DATA ===
  const sections = [
    { id: 0, title: "Intro", text: "Apple. The man. A few quotes." },
    { id: 1, title: "Keynote", text: "Stage presence & storytelling." },
    { id: 2, title: "Design", text: "Simplicity & craft." },
    { id: 3, title: "Legacy", text: "The aftermath & memory." },
  ];

  // === LAYOUT ===
  const [viewportH, setViewportH] = useState(window.innerHeight);
  useEffect(() => {
    const resize = () => setViewportH(window.innerHeight);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const contentH = sections.length * viewportH;
  const maxScroll = contentH - viewportH;

  // === MOTION VALUES ===
  const y = useMotionValue(0); // main content position
  const trackHeight = 200;
  const scrollProgress = useTransform(y, (val) => -val / maxScroll);
  const fillHeight = useTransform(scrollProgress, (p) => p * trackHeight);

  // === HELPERS ===
  const scrollTo = (next) => {
    if (next > 0) next = 0;
    if (next < -maxScroll) next = -maxScroll;
    animate(y, next, { type: "spring", stiffness: 80, damping: 20 });
  };

  const snapToNearest = () => {
    const raw = -y.get(); // positive scroll value
    const index = Math.round(raw / viewportH);
    const next = -(index * viewportH);
    animate(y, next, { type: "spring", stiffness: 100, damping: 25 });
  };

  // === WHEEL SCROLL ===
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      scrollTo(y.get() - e.deltaY * 2);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [maxScroll]);

  // === TOUCH SCROLL ===
  useEffect(() => {
    let startY = 0;
    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      const delta = e.touches[0].clientY - startY;
      scrollTo(y.get() + delta * 1.5);
      startY = e.touches[0].clientY;
    };
    const onTouchEnd = () => snapToNearest();

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [maxScroll, viewportH]);

  // === CLICK & HOLD ON TRACK ===
  const holdRef = useRef(null);
  const startHold = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const update = () => {
      const clickY = e.clientY - rect.top;
      const progress = clickY / trackHeight;
      const next = -(progress * maxScroll);
      scrollTo(next);
    };
    update();
    holdRef.current = setInterval(update, 200); // repeat while holding
  };
  const stopHold = () => {
    clearInterval(holdRef.current);
    holdRef.current = null;
  };

  // === RENDER ===
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

      {/* custom scrollbar */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2"
        style={{
          height: trackHeight,
          width: 8,
          background: "#334155",
          borderRadius: 4,
          // position: "relative",
        }}
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
      >
        {/* fill bar */}
        <motion.div
          style={{
            height: fillHeight,
            width: "100%",
            background: "#38bdf8",
            borderRadius: 4,
            originY: 0,
          }}
        />

        {/* draggable thumb */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: trackHeight }}
          dragElastic={0}
          onDrag={(e, info) => {
            const rect = e.target.parentNode.getBoundingClientRect();
            const relativeY = info.point.y - rect.top;
            const progress = Math.min(Math.max(relativeY / trackHeight, 0), 1);
            const next = -(progress * maxScroll);
            y.set(next);
          }}
          onDragEnd={snapToNearest}
          style={{
            y: fillHeight,
            left: "50%",
            translateX: "-50%",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "transparent",
            position: "absolute",
            top: 0,
            cursor: "grab",
          }}
        />
      </div>
    </div>
  );
}
