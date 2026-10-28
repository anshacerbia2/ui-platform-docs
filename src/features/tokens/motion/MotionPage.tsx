import { Block } from "@/components/docs/Block";
import { FactGrid } from "@/components/docs/FactGrid";
import { Facts } from "@/components/docs/Facts";
import { InlineCode } from "@/components/docs/InlineCode";
import { PageHead } from "@/components/docs/PageHead";
import { Sheet } from "@/components/docs/Sheet";
import { DocsLayout } from "@/components/shell/DocsLayout";
import { tokenList } from "@/shared/lib/reference";
import { TokenName } from "../TokenName";
import { TokenRows } from "../TokenRows";
import { tokenOf, valueOf } from "../tokens";
import { MotionDemo } from "./MotionDemo";
import styles from "./Motion.module.scss";

// STD-UIP-TKN-001, "Semantic Motion Language": each action and what it communicates.
const ACTIONS: [string, string][] = [
  ["feedback", "State on the same element: hover, press, focus, selection. The shortest."],
  ["disclosure", "A height that expands or collapses: an accordion, a menu, a detail."],
  [
    "enter",
    "Content mounting, a drawer sliding in, a dropdown opening; it decelerates into place.",
  ],
  ["exit", "Content leaving; it accelerates away, never slower than it entered."],
  ["attention", "Scale or opacity on a critical action, without moving the layout around it."],
];

const W = 120;
const H = 48;

/** The easing as a curve: time across, progress up. */
function Curve({ easing }: { easing: string }) {
  const [a = 0, b = 0, c = 1, d = 1] = (/cubic-bezier\(([^)]+)\)/.exec(easing)?.[1] ?? "")
    .split(",")
    .map(Number);
  const y = (v: number) => (H - v * H).toFixed(1);
  return (
    <svg className={styles.curve} viewBox={`-2 -2 ${W + 4} ${H + 4}`} aria-hidden="true">
      <path className={styles.axis} d={`M0 ${H} H${W} M0 0 V${H}`} />
      <path
        className={styles.line}
        d={`M0 ${H} C${(a * W).toFixed(1)} ${y(b)} ${(c * W).toFixed(1)} ${y(d)} ${W} 0`}
      />
    </svg>
  );
}

/** The motion guide: one duration and easing per action, drawn and played. */
export function MotionPage() {
  const tokens = tokenList.filter((t) => t.name.startsWith("motion."));
  const longest = Math.max(...ACTIONS.map(([a]) => parseFloat(valueOf(`motion.${a}.duration`))));
  return (
    <DocsLayout
      toc={[
        { id: "anatomy", title: "Anatomy" },
        { id: "actions", title: "Actions" },
        { id: "rules", title: "Rules" },
      ]}
    >
      <PageHead
        crumbs={[{ label: "Tokens", href: "/tokens" }, { label: "Motion" }]}
        title="Motion"
        lead="Motion is named for what it says, not for how long it takes: something opened, something left, something needs a look. Each action has a duration and an easing, used together."
      />
      <Facts
        label="Motion tokens"
        items={[
          { term: "Tokens", value: String(tokens.length) },
          { term: "Actions", value: String(ACTIONS.length) },
          { term: "Longest", value: `${longest}ms` },
        ]}
      />

      <Sheet id="anatomy" title="Anatomy" label="Anatomy of a motion token">
        <TokenName
          label="The motion token motion.enter.duration and the values each segment takes"
          segments={[
            { code: "motion", part: "Domain" },
            { code: "enter", part: "Action", values: ACTIONS.map(([a]) => a) },
            { code: "duration", part: "Member", values: ["duration", "easing"] },
          ]}
        />
        <Block>
          <p>
            Compose the two members with the property you animate:{" "}
            <InlineCode>
              transition: opacity var(--ds-motion-enter-duration) var(--ds-motion-enter-easing)
            </InlineCode>
            . There is no transition shorthand token.
          </p>
        </Block>
      </Sheet>

      <Sheet id="actions" title="Actions" meta={[{ term: "Pairs", value: String(ACTIONS.length) }]}>
        <Block>
          <p>
            Each curve is the easing: time runs across, progress up. Press play to watch the dot
            cross with the action&apos;s own duration and easing.
          </p>
        </Block>
        <TokenRows
          wide
          label="Motion actions"
          rows={ACTIONS.map(([action, note]) => {
            const duration = `motion.${action}.duration`;
            const easing = `motion.${action}.easing`;
            return {
              name: `motion.${action}`,
              cssName: `${tokenOf(duration).cssName.replace(/-duration$/, "")}-*`,
              note,
              specimen: (
                <span className={styles.specimen}>
                  <Curve easing={valueOf(easing)} />
                  <MotionDemo action={action} />
                </span>
              ),
              value: (
                <>
                  <span className={styles.lineValue}>{valueOf(duration)}</span>
                  <span className={styles.lineValue}>{valueOf(easing)}</span>
                </>
              ),
            };
          })}
        />
      </Sheet>

      <Sheet id="rules" title="Rules" meta={[{ term: "Source", value: "STD-UIP-TKN-001" }]}>
        <FactGrid
          label="Motion rules"
          items={[
            {
              term: "Enter decelerates, exit accelerates",
              value:
                "Content slows into place as it arrives and speeds away as it leaves, and an exit is never slower than its enter.",
            },
            {
              term: "Feedback is the quickest",
              value: "A hover or a press answers at once; no other action is shorter.",
            },
            {
              term: "Reduced motion wins",
              value:
                "When the reader asks for reduced motion, a component drops movement whatever the tokens say.",
            },
            {
              term: "Use both members",
              value:
                "Pair an action's duration with its own easing; never take one action's duration with another's curve.",
            },
          ]}
        />
      </Sheet>
    </DocsLayout>
  );
}
