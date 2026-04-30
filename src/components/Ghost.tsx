import { useEffect, useRef, useState } from "react";

const ghostPhotoModules = import.meta.glob(
  "/public/assets/ghost/*.{png,jpg,jpeg,webp,avif,gif}",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);
const ghostPhotoSources = Object.values(ghostPhotoModules) as string[];

interface GhostProps {
  ghostFaceSwapEnabled: boolean;
}

export function Ghost({ ghostFaceSwapEnabled }: GhostProps) {
  const [currentGhostPhoto, setCurrentGhostPhoto] = useState(
    ghostPhotoSources[0] ?? "",
  );
  const ghostPhotoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const face = document.querySelector<HTMLElement>(
      ".hero-ghost .ghost-face",
    );
    const photoFace = document.querySelector<HTMLElement>(
      ".hero-ghost .ghost-photo-face",
    );
    const eyeContainer = document.querySelector<HTMLElement>(
      ".hero-ghost .ghost-eyes",
    );
    const eyes = document.querySelectorAll<HTMLElement>(
      ".hero-ghost .eye",
    );

    if (!face || !photoFace || !eyeContainer || eyes.length === 0) {
      return;
    }

    let isBusy = false;

    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest(".fun-toggle")
      ) {
        return;
      }

      if (isBusy) return;
      isBusy = true;

      const canShowPhoto = ghostFaceSwapEnabled && ghostPhotoSources.length > 0;
      const showPhoto = canShowPhoto && Math.random() > 0.5;
      const isHappy = showPhoto || Math.random() > 0.5;

      if (isHappy) {
        if (showPhoto) {
          const nextPhoto =
            ghostPhotoSources[Math.floor(Math.random() * ghostPhotoSources.length)];

          setCurrentGhostPhoto(nextPhoto);
          if (ghostPhotoRef.current) {
            ghostPhotoRef.current.src = nextPhoto;
          }
        }

        const fStyle = window.getComputedStyle(face).transform;
        const eStyle = window.getComputedStyle(eyeContainer).transform;
        face.style.setProperty("--face-start-pos", fStyle);
        eyeContainer.style.setProperty("--eye-start-pos", eStyle);

        eyes.forEach((eye) => eye.classList.add("happy"));
        face.classList.add("face-happy-active");
        eyeContainer.classList.add("eye-happy-active");
        if (showPhoto) {
          photoFace.classList.add("photo-happy-active");
        }

        window.setTimeout(() => {
          eyes.forEach((eye) => eye.classList.remove("happy"));
          face.classList.remove("face-happy-active");
          eyeContainer.classList.remove("eye-happy-active");
          photoFace.classList.remove("photo-happy-active");
          isBusy = false;
        }, 6000);

        return;
      }

      eyes.forEach((eye) => eye.classList.add("angry"));
      document.documentElement.style.setProperty("--move-duration", "0.6s");
      window.setTimeout(() => {
        const fTrans = window.getComputedStyle(face).transform;
        const eTrans = window.getComputedStyle(eyeContainer).transform;
        face.style.animation = "none";
        eyeContainer.style.animation = "none";
        face.style.transform = fTrans;
        eyeContainer.style.transform = eTrans;
        face.offsetHeight;
        eyes.forEach((eye) => eye.classList.remove("angry"));
        const recoverTime = 0.6;
        face.style.transition = `transform ${recoverTime}s ease-in-out`;
        eyeContainer.style.transition = `transform ${recoverTime}s ease-in-out`;
        face.style.transform = "translateX(calc(-50% - 10px))";
        eyeContainer.style.transform = "translateX(-12px)";
        window.setTimeout(() => {
          document.documentElement.style.setProperty("--move-duration", "5s");
          face.style.transition = "";
          eyeContainer.style.transition = "";
          face.style.animation = "";
          eyeContainer.style.animation = "";
          face.style.transform = "";
          eyeContainer.style.transform = "";
          isBusy = false;
        }, recoverTime * 1000);
      }, 2000);
    };

    document.body.addEventListener("click", handleClick);

    return () => {
      document.body.removeEventListener("click", handleClick);
    };
  }, [ghostFaceSwapEnabled]);

  return (
    <div className="hero-ghost" aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="gc" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.846 A0.1,0.077 0 0,1 0.8,0.846 A0.1,0.077 0 0,0 0.6,0.846 A0.1,0.077 0 0,1 0.4,0.846 A0.1,0.077 0 0,0 0.2,0.846 A0.1,0.077 0 0,1 0,0.846 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="scene">
        <div className="sym sx" style={{ left: "18px", top: "148px" }}></div>
        <div
          className="sym sc"
          style={{ left: "10px", top: "192px", width: "18px", height: "18px" }}
        ></div>
        <div className="sym sp" style={{ left: "44px", bottom: "168px" }}></div>
        <div className="sym sx" style={{ right: "20px", top: "140px" }}></div>
        <div
          className="sym sc"
          style={{ right: "10px", top: "186px", width: "14px", height: "14px" }}
        ></div>
        <div className="sym sp" style={{ right: "44px", bottom: "168px" }}></div>

        <div className="ghost">
          <div className="ghost-face">
            <div className="ghost-eyes">
              <div className="eye eye-l"></div>
              <div className="eye eye-r"></div>
            </div>
          </div>
          <div className="ghost-photo-face">
            {currentGhostPhoto ? (
              <img
                ref={ghostPhotoRef}
                className="ghost-photo-face__image"
                src={currentGhostPhoto}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            ) : null}
          </div>
          <div className="ghost-feet">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div className="ghost-shadow"></div>
      </div>
    </div>
  );
}
