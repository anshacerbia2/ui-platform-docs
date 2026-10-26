import { SheetLayout } from "@/components/shell/SheetLayout";
import { BrandSheet } from "./brand/BrandSheet";
import { ContractsSheet } from "./contracts/ContractsSheet";
import { EvidenceSheet } from "./evidence/EvidenceSheet";
import { GuaranteesSheet } from "./guarantees/GuaranteesSheet";
import { ModesSheet } from "./modes/ModesSheet";
import { ProofSheet } from "./proof/ProofSheet";
import { TokensSheet } from "./tokens/TokensSheet";

/**
 * The public landing (scnehaux-design scnx-platform Docs-Landing.html): seven sheets
 * of one drawing set. Every claim on it is true of the pinned build (TDD docs-site D8).
 */
export function LandingPage() {
  return (
    <SheetLayout>
      <ProofSheet />
      <ModesSheet />
      <BrandSheet />
      <GuaranteesSheet />
      <TokensSheet />
      <EvidenceSheet />
      <ContractsSheet />
    </SheetLayout>
  );
}
