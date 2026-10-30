import { Cells } from "@/components/docs/Cells";
import { Cta } from "@/components/docs/Cta";
import { ArrowLeft, ArrowRight } from "@/components/docs/Icons";
import { Sheet } from "@/components/docs/Sheet";
import { Display, Lede } from "@/components/docs/Type";
import { SheetLayout } from "@/components/shell/SheetLayout";
import { CURVES, MOTION_ROLES } from "@/features/front-door/data";
import { Scope } from "@/features/front-door/Scope";
import door from "@/features/front-door/FrontDoor.module.scss";
import styles from "./MotionPage.module.scss";

/**
 * The motion world's page while its package is built (the owner, 2026-10-30): what it
 * will be, said as a plan, beside the motion tokens it will be timed by, which ship today.
 */
export function MotionPage() {
  return (
    <SheetLayout>
      <Sheet
        id="motion"
        title="Motion"
        label="Coming soon"
        labelledBy="motion-title"
        meta={[
          { term: "Package", value: "in fabrication" },
          { term: "Motion roles", value: String(MOTION_ROLES) },
        ]}
      >
        <Cells className={styles.hero}>
          <div className={styles.copy}>
            <Display id="motion-title">Movement, measured.</Display>
            <Lede>
              A motion library is in fabrication: enter, exit and feedback for the components and
              the primitives alike, timed by the motion roles the tokens already ship. Until it
              lands, the tokens are yours to use.
            </Lede>
            <div className={styles.actions}>
              <Cta href="/tokens/motion" variant="primary" icon={<ArrowRight size={16} />}>
                Motion tokens
              </Cta>
              <Cta href="/" icon={<ArrowLeft size={16} />}>
                Back to the front door
              </Cta>
            </div>
          </div>
          <div className={`${door.screen} ${styles.screen}`}>
            <Scope curves={CURVES} />
          </div>
        </Cells>
      </Sheet>
    </SheetLayout>
  );
}
