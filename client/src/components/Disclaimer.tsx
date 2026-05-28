export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-3 text-xs text-yellow-200">
        ⚠️ Support tool only — does not replace ERG, local SOPs, IC, HazMat Technicians, CHEMTREC, or official guidance.
      </div>
    );
  }
  return (
    <div className="bg-yellow-900/40 border border-yellow-600 rounded-xl p-4 text-sm text-yellow-200">
      <p className="font-bold text-yellow-400 mb-2">⚠️ IMPORTANT DISCLAIMER</p>
      <p>
        This app is a first responder support tool for the initial phase of a hazmat incident.
        It does not replace the <strong>Emergency Response Guidebook</strong>, local SOPs,
        Incident Command, HazMat Technicians, CHEMTREC, emergency management, law enforcement,
        EMS, or official agency guidance.
      </p>
    </div>
  );
}
