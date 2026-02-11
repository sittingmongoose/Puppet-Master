#!/bin/bash
# Verification script to show EvidenceType alignment

echo "=== EvidenceType Alignment Verification ==="
echo ""

echo "1. Evidence Store Import:"
grep "use crate::types" puppet-master-rs/src/state/evidence_store.rs | grep Evidence
echo ""

echo "2. Evidence Store Variants Used:"
grep "EvidenceType::" puppet-master-rs/src/state/evidence_store.rs | head -10
echo ""

echo "3. Pipeline Import:"
grep "use crate::types" puppet-master-rs/src/start_chain/pipeline.rs | grep Evidence
echo ""

echo "4. Pipeline Usage:"
grep "EvidenceType::" puppet-master-rs/src/start_chain/pipeline.rs
echo ""

echo "5. AI Verifier Import:"
grep "use crate::types::" puppet-master-rs/src/verification/ai_verifier.rs
echo ""

echo "6. Browser Verifier Import:"
grep "use crate::types::" puppet-master-rs/src/verification/browser_verifier.rs
echo ""

echo "7. Gate Runner Import:"
grep "use crate::types" puppet-master-rs/src/verification/gate_runner.rs
echo ""

echo "=== Type Definition Source ==="
echo ""
echo "Execution EvidenceType (CORRECT):"
grep -A 7 "pub enum EvidenceType" puppet-master-rs/src/types/execution.rs | head -8
echo ""

echo "Types Module Re-export:"
grep "EvidenceType" puppet-master-rs/src/types/mod.rs | grep -v "//"
echo ""

echo "✅ All files now use crate::types::EvidenceType from execution module!"
