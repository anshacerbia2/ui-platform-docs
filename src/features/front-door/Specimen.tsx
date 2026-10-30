import type { ReactNode } from "react";
import { Badge } from "@/components/system/Badge";
import { Button } from "@/components/system/Button";
import { Heading } from "@/components/system/Heading";
import { Kbd } from "@/components/system/Kbd";
import { Text } from "@/components/system/Text";
import { Checks } from "./Checks";
import { Target } from "./Target";
import styles from "./FrontDoor.module.scss";

/** A part of the specimen under its balloon: the number the bench's parts list reads. */
function Part({ no, behavior, children }: { no: string; behavior?: boolean; children: ReactNode }) {
  return (
    <div className={styles.part} data-no={no} data-behavior={behavior ? "" : undefined}>
      {children}
    </div>
  );
}

/**
 * The bench's specimen (the owner, 2026-10-30): a release panel of the design system's
 * own components, the same in every world, so its geometry is one and the scan line
 * between two worlds cuts one panel in two, finished on one side and bare on the other.
 * Each world only repaints it (FrontDoor.module.scss). Its parts are the parts list's
 * (data.ts BOM), in order. It is a picture, so it is hidden from assistive technology and
 * never takes focus; the world's copy says what it shows.
 */
export function Specimen() {
  return (
    <div className={styles.card} aria-hidden="true" inert>
      <div className={styles.cardHead}>
        <Part no="01">
          <Badge scheme="success" size="small" dot>
            Checks passed
          </Badge>
        </Part>
        <span className={styles.cardMeta}>Run 128 · 2m 14s</span>
      </div>
      <Part no="02">
        <Heading as="h3" size="small" weight="semibold">
          Release to production
        </Heading>
      </Part>
      <Part no="03">
        <Text>Signed, attested, and checked in every mode before it ships.</Text>
      </Part>
      <Part no="04" behavior>
        <Target />
      </Part>
      <Part no="05">
        <Checks />
      </Part>
      <div className={styles.cardFoot}>
        <Part no="06">
          <span className={styles.keys}>
            <Kbd>Ctrl</Kbd>
            <Kbd>Enter</Kbd>
          </span>
        </Part>
        <div className={styles.cardActions}>
          <Part no="07" behavior>
            <Button variant="secondary" size="small" tabIndex={-1}>
              Cancel
            </Button>
          </Part>
          <Part no="07" behavior>
            <Button variant="primary" size="small" tabIndex={-1}>
              Deploy
            </Button>
          </Part>
        </div>
      </div>
    </div>
  );
}
