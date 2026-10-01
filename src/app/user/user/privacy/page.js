
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#EFE9E1] text-[#322D29]">

      <header className="bg-[#322D29]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.25em] text-[#EFE9E1]"
          >
            VELORA
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#EFE9E1] hover:text-[#AC9C8D]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-16">

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#72383D]">
            VELORA
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            Privacy Policy
          </h1>
        </div>

        <article className="mt-12 space-y-8 rounded-3xl bg-white p-7 shadow-sm sm:p-10">

          <Section title="1. Information We Collect">
            We may collect information provided when you create an account,
            place an order, contact customer care, or use our website.
          </Section>

          <Section title="2. How We Use Information">
            Information may be used to process orders, provide customer
            support, manage accounts, improve our services, and communicate
            important order updates.
          </Section>

          <Section title="3. Account Information">
            Customers are responsible for keeping their account information
            accurate and protecting their account credentials.
          </Section>

          <Section title="4. Order Information">
            Information related to your orders may be stored so that we can
            process purchases, provide delivery services, and support returns
            or exchanges.
          </Section>

          <Section title="5. Cookies">
            VELORA may use cookies and similar technologies to support
            website functionality and improve the user experience.
          </Section>

          <Section title="6. Contact">
            If you have questions about this Privacy Policy, please contact
            VELORA through our Contact Us page.
          </Section>

        </article>
      </section>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-7 text-[#322D29]/65">
        {children}
      </p>
    </section>
  );
}

