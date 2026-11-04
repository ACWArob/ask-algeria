"use client";

/** Prints only the element with id `target`: marks <html> for the print CSS of that card, then clears it. */
export function PrintCardButton({ target, label }: { target: string; label: string }) {
  function print() {
    const root = document.documentElement;
    root.setAttribute("data-print-only", target);
    const clear = () => {
      root.removeAttribute("data-print-only");
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
  }
  return (
    <button type="button" onClick={print} className="btn-quiet !min-h-[40px] text-sm print:hidden">
      {label}
    </button>
  );
}
