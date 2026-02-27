#!/bin/bash
# ---------------------------------------------------------------------------
# prepare-facetec-xcframework.sh
#
# CocoaPods does not fully handle vendored xcframeworks in pods that also
# have source files (only aggregate-target pods like hermes-engine work
# automatically). This script works around two missing pieces:
#   1. Extract the correct platform slice before Swift compilation
#   2. Patch the consumer's embed-frameworks script so the dynamic framework
#      is bundled inside the .app at runtime
# ---------------------------------------------------------------------------
set -e

# --- 1. Extract the correct xcframework slice for the current platform -----
"${PODS_ROOT}/Target Support Files/soyio_rn_sdk/soyio_rn_sdk-xcframeworks.sh"

# --- 2. Patch consumer embed-frameworks script -----------------------------
# CocoaPods generates Pods-<Target>-frameworks.sh to embed dynamic frameworks
# but omits FaceTecSDK. Append the install_framework call so the framework is
# copied into the .app bundle.
EMBED_LINE='install_framework "${PODS_XCFRAMEWORKS_BUILD_DIR}/soyio_rn_sdk/FaceTecSDK.framework"'
for fw_script in "${PODS_ROOT}/Target Support Files"/Pods-*/Pods-*-frameworks.sh; do
  [ -f "$fw_script" ] || continue
  grep -q 'soyio_rn_sdk/FaceTecSDK' "$fw_script" && continue
  awk -v line="$EMBED_LINE" '/^if.*COCOAPODS_PARALLEL_CODE_SIGN/{print line}1' "$fw_script" > "${fw_script}.tmp"
  mv "${fw_script}.tmp" "$fw_script"
  chmod +x "$fw_script"
done
