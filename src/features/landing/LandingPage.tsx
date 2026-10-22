import { SiteFooter } from "@/features/site-shell/SiteFooter";
import { SiteHeader } from "@/features/site-shell/SiteHeader";
import { Details } from "./details/Details";
import { Hero } from "./hero/Hero";
import { ThemeLabSection } from "./lab/ThemeLabSection";
import { LightsSection } from "./lights/LightsSection";
import { Announcement } from "./sections/Announcement";
import { Cta } from "./sections/Cta";
import { Marquee } from "./sections/Marquee";
import { Pillars } from "./sections/Pillars";
import { Stats } from "./sections/Stats";
import { Verify } from "./sections/Verify";
import { TypedTokens } from "./tokens/TypedTokens";
import styles from "./LandingPage.module.scss";

export function LandingPage() {
  return (
    <>
      <Announcement />
      <div className={`o-container ${styles.page}`}>
        <SiteHeader />
        <main id="main" className={styles.main}>
          <Hero />
          <Marquee />
          <LightsSection />
          <ThemeLabSection />
          <Details />
          <TypedTokens />
          <Stats />
          <Verify />
          <Pillars />
          <Cta />
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
