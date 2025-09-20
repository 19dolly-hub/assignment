import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CgMenuRight } from "react-icons/cg";

function App() {
  const sections = [
    { id: 0, title: "Intro", text: "Apple. The man. A few quotes." },
    { id: 1, title: "Keynote", text: "Stage presence & storytelling." },
    { id: 2, title: "Design", text: "Simplicity & craft." },
    { id: 3, title: "Legacy", text: "The aftermath & memory." },
  ];

  const [open, setOpen] = useState(false);

  const y = useMotionValue(0);
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  // vertical progress bar
  const yProgress = useTransform(y, (v) => {
    const container = containerRef.current;
    if (!container) return 0;
    const totalHeight = container.scrollHeight;
    const maxScroll = totalHeight - window.innerHeight;
    return Math.min(Math.max(-v / maxScroll, 0), 1);
  });
  const yProgressHeight = useTransform(yProgress, (p) => `${p * 100}%`);

  useEffect(() => {
    // resolve refresh bug
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    y.set(0);

    const container = containerRef.current;
    const maxScroll = container.scrollHeight - window.innerHeight;

    // wheel / touchpad
    const onWheel = (e) => {
      let newY = y.get() - e.deltaY;

      // 0 >= y >= -maxScroll
      if (newY > 0) newY = 0;
      if (newY < -maxScroll) newY = -maxScroll;

      animate(y, newY, { type: "spring", stiffness: 1000, damping: 20 });
      // console.log(yProgress);
    };

    // mobile touch
    let startY = 0;

    const onTchS = (e) => {
      startY = e.touches[0].clientY;
    };
    const onTchM = (e) => {
      const currY = e.touches[0].clientY;
      const deltaY = currY - startY;

      let newY = y.get() + deltaY * 10;

      // 0 >= y >= -maxScroll
      if (newY > 0) newY = 0;
      if (newY < -maxScroll) newY = -maxScroll;

      animate(y, newY, {
        type: "tween",
        ease: "easeOut",
        duration: 0.4,
      });
      startY = currY;
    };

    window.addEventListener("wheel", onWheel);
    window.addEventListener("touchstart", onTchS);
    window.addEventListener("touchmove", onTchM);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTchS);
      window.removeEventListener("touchmove", onTchM);
    };
  }, [y]);

  // Handle track click & drag
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const container = containerRef.current;
    if (!container) return;

    const maxScroll = container.scrollHeight - window.innerHeight;

    let isDragging = false;
    let startY = 0;
    let moved = false; // flag to detect drag vs click

    // helper function
    const calculateNewY = (clientY) => {
      const rect = track.getBoundingClientRect();
      const posY = clientY - rect.top;
      const ratio = Math.min(Math.max(posY / rect.height, 0), 1);
      return -ratio * maxScroll;
    };

    const handlePointerDown = (e) => {
      isDragging = true;
      moved = false;
      startY = e.clientY;

      // y.set(calculateNewY(e.clientY));
      animate(y, calculateNewY(e.clientY), { type: "tween", duration: 0.5 });

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);

      if (track.setPointerCapture) track.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;

      requestAnimationFrame(() => {
        y.set(calculateNewY(e.clientY));
      });
    };

    const handlePointerUp = (e) => {
      if (!moved) {
        animate(y, calculateNewY(e.clientY), { type: "tween", duration: 0.5 });
      }

      isDragging = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    track.addEventListener("pointerdown", handlePointerDown);

    return () => {
      track.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [y]);

  return (
    <>
      <motion.section
        ref={containerRef}
        style={{ y }}
        className="text-white"
      >
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
      </motion.section>

      <CgMenuRight
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 md:hidden flex flex-col justify-between text-2xl text-white"
      />

      {/* scroll progress bar */}
      <div
        ref={trackRef}
        className={`
          fixed right-3 top-1/2 -translate-y-1/2 h-[80vh] w-[3px] rounded-md touch-none
          bg-gray-400 hover:w-[4.5px]
          transition-all duration-300
          md:block
          ${open ? "block" : "hidden"}
        `}
      >
        <motion.div
          style={{ height: yProgressHeight }}
          className="w-full bg-blue-500 rounded-md origin-top"
        />
      </div>
    </>
  );
}

export default App;
