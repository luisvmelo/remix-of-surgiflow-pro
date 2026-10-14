import { useFilters } from "@opme/contexts/FilterContext";
import { formatNumber } from "@opme/utils/formatters";
import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@opme/config/produto";
import HospitalSelector from "@opme/components/produto/HospitalSelector";

const Topbar = () => {
  const { filteredPatients } = useFilters();
  return (
    <header className="bg-neutral-0 px-6 py-5 border-b border-neutral-100">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-d2 font-bold text-[#325aa4]">{PRODUCT_NAME}</h1>
          <p className="text-paragraph mt-1 text-[#9da5b2] text-base font-semibold">{PRODUCT_TAGLINE}</p>
        </div>
        <div className="flex items-center gap-6">
          <HospitalSelector />
          <div className="text-center">
            <p className="text-copy font-semibold text-neutral-400 mb-1">Total Filtrado</p>
            <p className="text-d4 font-bold text-brand-400">{formatNumber(filteredPatients.length)}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Topbar;
