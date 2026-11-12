import { animate } from "animejs/animation";
import { createTimer } from "animejs/timer";

const diagram = document.querySelector(".loop-diagram");
const scenes = diagram ? [...diagram.querySelectorAll(".loop-scene")] : [];

if (scenes.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let active = 0;

  createTimer({
    duration: 7600,
    loop: true,
    onLoop: () => {
      const next = (active + 1) % scenes.length;
      animate(scenes[active], {
        opacity: 0,
        duration: 300,
        ease: "inOutQuad",
        onComplete: () => animate(scenes[next], { opacity: 1, duration: 300, ease: "inOutQuad" }),
      });
      active = next;
    },
  });
}


const eventList = document.querySelector(".events");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (eventList && !reduceMotion && "IntersectionObserver" in window) {
  eventList.querySelectorAll("li").forEach((row, index) => row.style.setProperty("--event-index", index));
  eventList.classList.add("is-animating");
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      eventList.classList.add("is-visible");
      observer.disconnect();
    }
  }, { threshold: 0.2 });
  observer.observe(eventList);
}
