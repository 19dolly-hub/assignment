import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CgMenuRight } from "react-icons/cg";

function App() {
  const sections = [
    {
      id: 0,
      title: "Intro",
      text: "Apple. The man. A few quotes. Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias placeat veniam earum, cum quasi vitae cupiditate doloremque illo quae architecto nobis quod aliquid, officiis tenetur saepe dolorum ducimus, molestiae corporis sunt. At rem accusantium molestiae nihil odio animi voluptatum doloribus alias ullam nulla esse laudantium quisquam, officia ex rerum hic reprehenderit perspiciatis, aut vel recusandae? Voluptates saepe nam impedit in molestias, est cum culpa qui placeat dicta dignissimos ab, rerum ut sit error quae expedita harum quis alias ipsa enim maxime, hic accusamus. Commodi, esse odio culpa praesentium pariatur voluptatum fuga officia laboriosam veritatis necessitatibus, incidunt veniam corrupti omnis ut!",
    },
    {
      id: 1,
      title: "Keynote",
      text: "Stage presence & storytelling. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae obcaecati vel nobis esse, numquam maiores veniam voluptatem nisi a dolorem quis necessitatibus! Nam cumque necessitatibus maxime nesciunt. Aspernatur exercitationem delectus voluptatem nemo in magni pariatur numquam incidunt accusantium debitis cumque, quo tenetur corporis, nobis perferendis culpa voluptas ipsam totam laboriosam tempora, quasi quam expedita laudantium? Ut veritatis, dicta minima, in mollitia aliquid nam nostrum quasi animi voluptatum similique. Natus aperiam quo consectetur, eius repellendus error cumque nam reprehenderit accusamus quod rerum ex omnis mollitia odio totam magni repudiandae odit earum! Architecto vero fugiat sequi facilis distinctio laudantium deleniti, recusandae aliquid dicta error quibusdam deserunt repellat vitae doloribus soluta eos totam dolorem eius ea optio consequatur! Aperiam, non cum quae odio minus asperiores ab, vero nemo reiciendis voluptas ad sint esse! Maxime totam a sequi minima quod eaque consectetur ipsam atque magnam provident porro, consequatur delectus. Consequatur voluptates tempora illo et!",
    },
    {
      id: 2,
      title: "Design",
      text: "Simplicity & craft. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iure officiis molestiae aliquam sunt pariatur id voluptates maxime, adipisci voluptate numquam esse fuga quidem, voluptatibus minus recusandae laborum nemo. Reiciendis natus hic facere incidunt? Quidem corrupti, aut accusantium reprehenderit tempore rerum mollitia aliquam pariatur blanditiis praesentium iusto. Ipsam eius ea delectus.",
    },
    {
      id: 3,
      title: "Legacy",
      text: "The aftermath & memory. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Iure officiis molestiae aliquam sunt pariatur id voluptates maxime, adipisci voluptate numquam esse fuga quidem, voluptatibus minus recusandae laborum nemo. Reiciendis natus hic facere incidunt? Quidem corrupti, aut accusantium reprehenderit tempore rerum mollitia aliquam pariatur blanditiis praesentium iusto. Ipsam eius ea delectus.",
    },
  ];

  const [open, setOpen] = useState(false);
  // const [secHArr, setSecHArr] = useState([]);

  const y = useMotionValue(0);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  // const sectionRefs = useRef([]);

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
    // const arr = sectionRefs.current.map((e) =>
    //   Math.floor((e.scrollHeight / containerRef.current.scrollHeight) * 100)
    // );
    // setSecHArr(arr);

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

      animate(y, newY, { type: "tween", ease: "easeOut", duration: 0.1 });
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
      <motion.section ref={containerRef} style={{ y }} className="text-white">
        {sections.map((s) => (
          <section
            key={s.id}
            // ref={(el) => (sectionRefs.current[i] = el)}
            className="min-h-screen p-15 flex flex-col items-center justify-center"
            style={{ background: s.id % 2 === 0 ? "#0f172a" : "#1e293b" }}
          >
            <h2 className="text-5xl font-bold mb-6">{s.title}</h2>
            <p className="text-xl max-w-2xl">{s.text}</p>
          </section>
        ))}
      </motion.section>

      <CgMenuRight
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-50 cursor-pointer md:hidden flex flex-col justify-between text-2xl text-white"
      />

      {/* scroll progress bar */}
      {/* <div
        ref={trackRef}
        className={`
          group fixed right-0 top-1/2 -translate-y-1/2 h-[80vh] w-[10vw] touch-none
        `}
      >
        <div className={`
          fixed right-4 top-1/2 -translate-y-1/2 h-[80vh] w-[2px] rounded-md group-hover:w-[5px] cursor-pointer
          transition-all duration-300
          md:flex flex-col gap-[5px]
          ${open ? "flex" : "hidden"}
        `}>

        {secHArr.map((h, i) => (
          <div
            key={i}
            className="w-full bg-gray-400"
            style={{ height: h + "%" }}
          ></div>
        ))}
        </div>
      </div> */}
      <div className="group fixed right-0 top-1/2 -translate-y-1/2 h-[80vh] w-[10vw] touch-none">
        <div
          ref={trackRef}
          className={`
          fixed right-4 top-1/2 -translate-y-1/2 h-[80vh] w-[3px] rounded-md
          bg-gray-400 group-hover:w-[5px] cursor-pointer
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
      </div>
    </>
  );
}

export default App;
