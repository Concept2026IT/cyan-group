/* Holding page. Phase 2 builds the real homepage section by section in the
   order set out in BRIEF §6.1. This exists to exercise the token system and
   keep the build green. */
export default function Home() {
  return (
    <main id="main">
      <section className="bg-black text-paper">
        <div className="well rhythm">
          <p className="font-mono text-12 tracking-widest text-cyan uppercase">
            Foundation — phase 0
          </p>
          <h1 className="mt-8 text-52 font-extrabold uppercase lg:text-96">
            Branded <span className="outline-type">merch &amp;</span>
            <br />
            print <span className="outline-type">management</span>
          </h1>
          <p className="mt-8 max-w-(--container-measure) text-18">
            Design tokens, type scale and motion easings are wired. The
            component library is next.
          </p>
        </div>
      </section>

      <section className="bg-stock">
        <div className="well rhythm">
          <p className="font-mono text-12 tracking-widest text-cyan-deep uppercase">
            Palette
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: "black", className: "bg-black" },
              { name: "cyan", className: "bg-cyan" },
              { name: "cyan-deep", className: "bg-cyan-deep" },
              { name: "cyan-wash", className: "bg-cyan-wash" },
              { name: "ink", className: "bg-ink" },
              { name: "stock", className: "bg-stock" },
              { name: "paper", className: "bg-paper" },
              { name: "alert", className: "bg-alert" },
            ].map((token) => (
              <li key={token.name}>
                <div
                  className={`h-20 border border-ink/10 ${token.className}`}
                />
                <p className="mt-2 font-mono text-12 text-ink">{token.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
