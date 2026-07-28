import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTABlock } from "@/components/ui/CTABlock";
import { FormField, SelectField, TextAreaField } from "@/components/ui/FormField";
import { LogoStrip } from "@/components/ui/LogoStrip";
import { Section } from "@/components/ui/Section";
import { Stat } from "@/components/ui/Stat";

/* Internal reference, not part of the §5 IA. Kept out of the index so it
   can't become an orphan page in the sense the brief means. */
export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const CLIENTS = [
  "DHL",
  "Emirates",
  "Hilton",
  "UEFA Champions League",
  "Marriott",
  "Lord's",
  "Piccolino",
];

const FAQS = [
  {
    question: "What does print management actually cost?",
    answer:
      "It depends on volume and complexity, but the saving usually comes from consolidation rather than unit price — one supplier, one artwork approval route, one delivery schedule.",
  },
  {
    question: "Can you handle multi-site distribution?",
    answer:
      "Yes. Storage, kitting and distribution run from our own facility, with stock visibility for your team.",
  },
  {
    question: "How do you evidence sustainability?",
    answer:
      "ISO 14001, EcoVadis assessment and a documented supplier audit trail. Everything is available as a tender pack.",
  },
];

export default function Styleguide() {
  return (
    <main id="main">
      <Section tone="black" label="Component library" rule edgeLight>
        <Breadcrumb
          tone="dark"
          items={[
            { name: "Home", href: "/" },
            { name: "Styleguide", href: "/styleguide/" },
          ]}
          className="mb-10"
        />
        <h1 className="text-52 font-extrabold uppercase lg:text-96">
          Design <span className="outline-type">system</span>
        </h1>
        <p className="mt-8 max-w-(--container-measure) text-18 text-paper/80">
          Every component ships with default, hover, active, focus-visible and
          disabled states. Tab through this page to check the focus ring.
        </p>
      </Section>

      {/* ---- Buttons ---- */}
      <Section tone="stock" label="Button" rule>
        <p className="mb-10 max-w-(--container-measure) text-16 text-ink/80">
          Cyan fill is scarce: one per page, reserved for the discovery call.
          Primary is black on cyan at 8.3:1 — there is no white-on-cyan variant,
          it measures 2.53:1 and fails AA outright. This page is a reference and
          so breaks the one-fill rule deliberately.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">Book a discovery call</Button>
          <Button size="md">Book a discovery call</Button>
          <Button size="sm">Book a discovery call</Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button variant="secondary" surface="light">
            Request a quote
          </Button>
          <Button variant="ghost" surface="light">
            Browse the catalogue
          </Button>
          <Button variant="secondary" surface="light" disabled>
            Disabled
          </Button>
        </div>

        <div className="mt-10 rounded-2xl bg-black p-8">
          <p className="mb-6 font-mono text-12 tracking-widest text-cyan uppercase">
            On a black surface
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button>Book a discovery call</Button>
            <Button variant="secondary" surface="dark">
              Request a quote
            </Button>
            <Button variant="ghost" surface="dark">
              Browse the catalogue
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-cyan p-8">
          <p className="mb-6 font-mono text-12 tracking-widest text-black uppercase">
            On a cyan field — quiet variants go black, since cyan-deep on cyan
            is 2.0:1 and fails 1.4.11
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="secondary" surface="cyan">
              Book a discovery call
            </Button>
            <Button variant="ghost" surface="cyan">
              Browse the catalogue
            </Button>
          </div>
        </div>
      </Section>

      {/* ---- Cards ---- */}
      <Section tone="paper" label="Card" rule>
        <div className="grid gap-6 md:grid-cols-3">
          <Card
            tone="paper"
            href="/branded-merchandise/"
            linkLabel="Branded merchandise"
            className="border border-ink/12"
          >
            <h3 className="text-28 font-bold uppercase">Branded merchandise</h3>
            <p className="mt-4 text-16 text-ink/80">
              Programmes, stores, onboarding kits, events.
            </p>
          </Card>
          <Card tone="wash">
            <h3 className="text-28 font-bold uppercase">Print management</h3>
            <p className="mt-4 text-16 text-ink/80">
              Procurement, production, literature, POS, logistics.
            </p>
          </Card>
          <Card tone="black">
            <h3 className="text-28 font-bold uppercase">One account</h3>
            <p className="mt-4 text-16 text-paper/80">
              One contact. One audit trail.
            </p>
          </Card>
        </div>
      </Section>

      {/* ---- Stats ---- */}
      <Section tone="black" label="Stat" rule edgeLight>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={25} suffix="+" label="Years" tone="dark" />
          <Stat value={15} prefix="Top " suffix="%" label="EcoVadis" tone="dark" />
          <Stat value={22} label="Countries shipped" tone="dark" />
          <Stat value={14000} label="Kits fulfilled" tone="dark" />
        </div>
      </Section>

      {/* ---- Logo strip ---- */}
      <Section tone="stock" label="LogoStrip" rule>
        <LogoStrip label="Clients Cyan has delivered for">
          {CLIENTS.map((client) => (
            <span
              key={client}
              className="font-mono text-18 tracking-widest text-ink/70 uppercase"
            >
              {client}
            </span>
          ))}
        </LogoStrip>
      </Section>

      {/* ---- Accordion ---- */}
      <Section tone="paper" label="Accordion" rule>
        <Accordion items={FAQS} className="max-w-3xl" />
      </Section>

      {/* ---- Form fields ---- */}
      <Section tone="stock" label="FormField" rule>
        <div className="grid max-w-3xl gap-8 md:grid-cols-2">
          <FormField id="sg-name" label="Name" required placeholder="Jane Okafor" />
          <FormField
            id="sg-email"
            label="Work email"
            type="email"
            required
            error="Enter a valid work email address."
          />
          <SelectField
            id="sg-spend"
            label="Approximate annual spend"
            hint="Used to route your enquiry to the right team."
            options={[
              { value: "", label: "Select a band" },
              { value: "under-5k", label: "Under £5,000" },
              { value: "5k-15k", label: "£5,000 – £15,000" },
              { value: "15k-50k", label: "£15,000 – £50,000" },
              { value: "50k-plus", label: "£50,000+" },
            ]}
          />
          <FormField id="sg-disabled" label="Disabled" disabled value="" readOnly />
          <TextAreaField
            id="sg-detail"
            label="What do you need?"
            className="md:col-span-2"
          />
        </div>
      </Section>

      {/* ---- CTA block ---- */}
      <Section tone="paper" label="CTABlock" rule>
        <CTABlock
          heading="Let's take the category off your desk"
          body="Thirty minutes, no obligation. We'll look at what you're spending, who you're buying from, and where the consolidation is."
          secondary={{
            label: "Not ready? Get the capability pack",
            href: "/credentials/",
          }}
        />
      </Section>
    </main>
  );
}
