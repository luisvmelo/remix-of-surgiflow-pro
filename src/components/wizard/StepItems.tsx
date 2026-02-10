import { useState, useEffect } from "react";
import { useSurgical } from "@/contexts/SurgicalContext";
import { mockRecommendedOPMEs } from "@/lib/mockData";
import { SuggestedItems, HistoricalItems, EquivalenceItems } from "./items/ItemLists";
import ItemSearch from "./items/ItemSearch";
import ItemCart from "./items/ItemCart";
import ItemSmartSelection from "./items/ItemSmartSelection";
import MetricsBar from "./MetricsBar";

interface SelectedItem {
  name: string;
  quantity: number;
}

const StepItems = () => {
  const { state, updateState, setStep } = useSurgical();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const operadoraName = state.operadora?.name || "—";

  const toggleItem = (name: string, quantity?: number) => {
    setSelectedItems((prev) =>
      prev.some((s) => s.name === name)
        ? prev.filter((s) => s.name !== name)
        : [...prev, { name, quantity: quantity || 1 }]
    );
  };

  const setQuantity = (name: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.name === name ? { ...s, quantity: qty } : s))
    );
  };

  const applyAllItems = (newItems: SelectedItem[]) => {
    setSelectedItems((prev) => [...prev, ...newItems.filter((n) => !prev.some((p) => p.name === n.name))]);
  };

  // Update metrics when items change
  useEffect(() => {
    const prevRent = state.rentabilityScore;
    const prevGloss = state.glossRisk;

    const itemRentDelta = selectedItems.reduce((acc, sel) => {
      const item = mockRecommendedOPMEs.find((o) => o.name === sel.name);
      if (!item) return acc;
      const val = parseInt(item.impactDelta.replace(/[^\d-]/g, "")) || 0;
      return acc + (val > 0 ? 2 * sel.quantity : -1 * sel.quantity);
    }, 0);

    const itemGlossDelta = selectedItems.reduce((acc, sel) => {
      const item = mockRecommendedOPMEs.find((o) => o.name === sel.name);
      if (!item) return acc;
      return acc + (item.isGlosado ? 4 * sel.quantity : item.isOfensor ? 2 : -1);
    }, 0);

    // Base from previous step preserved, add item deltas
    const baseRent = state.linkedProcedures.length > 0 ? prevRent : 4;
    const baseGloss = state.linkedProcedures.length > 0 ? prevGloss : 8;

    updateState({
      rentabilityScore: baseRent + itemRentDelta,
      glossRisk: Math.max(0, baseGloss + itemGlossDelta),
    });
  }, [selectedItems]);

  const handleNext = () => {
    updateState({ currentStep: 4 });
    setStep(4);
  };

  return (
    <div className="flex h-full">
      {/* Left: item lists */}
      <div className="flex-1 overflow-y-auto p-4 lg:px-6 lg:pt-4 lg:pb-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground leading-tight">Itens OPME</h2>
            <p className="text-muted-foreground text-xs mt-0.5">
              Adicione materiais e implantes para{" "}
              <strong className="text-foreground">{state.selectedProcedure?.name}</strong>
            </p>
          </div>
          <MetricsBar />
        </div>

        <ItemSmartSelection selectedItems={selectedItems} onApplyAll={applyAllItems} />

        <ItemSearch selectedItems={selectedItems} onToggle={toggleItem} />

        <SuggestedItems
          selectedItems={selectedItems}
          onToggle={toggleItem}
          onQuantity={setQuantity}
          operadoraName={operadoraName}
        />

        <HistoricalItems
          selectedItems={selectedItems}
          onToggle={toggleItem}
          onQuantity={setQuantity}
          operadoraName={operadoraName}
        />

        <EquivalenceItems
          selectedItems={selectedItems}
          onToggle={toggleItem}
          onQuantity={setQuantity}
        />
      </div>

      {/* Right: cart */}
      <ItemCart
        selectedItems={selectedItems}
        onRemove={toggleItem}
        onQuantity={setQuantity}
        onNext={handleNext}
      />
    </div>
  );
};

export default StepItems;
